const { App } = require('@slack/bolt');
const { WebClient, LogLevel } = require('@slack/web-api');
const { isEmpty, get, filter } = require('lodash');
const moment = require('moment');
const { thankYouMessageAfterEveryAction } = require('../helpers/design');
const {
  users,
} = require('../models/index');
const { findQuestionMasterById } = require('../Dao/questionMaster');
const { findChannelById } = require('../Dao/Channels');
const { excludeSomeQuestionId } = require('../Dao/questionMetadata');
const {
  findAllActiveGameByChannelId, findGameByGameId, findCountNextScheduledGames, updateGameActiveStatus
} = require('../Dao/games');
const { findRecordBySlackIdAndChannelId } = require('../Dao/Records');
const { findGameByGameIdAndUserId, createVoteMeta } = require('../Dao/vote_metadata');
const { gameFlow } = require('../controllers/Game/game.helper');
const { slackbots } = require('../models/index');
const { randomizeArray } = require('../helpers/helpers')
const { DEADLINE_REMINDER } = require('../helpers/messages');
const { findReminderBySlackId } = require('../Dao/reminders')

const botToken = process.env.SLACK_BOT_TOKEN;

const app = new App({
  token: botToken,
  socketMode: true, // enable the following to use socket mode
  appToken: process.env.APP_TOKEN,
});

async function deleteSchduledMessage(client, messageId, channelId) {
  try {
    // Call the chat.deleteScheduledMessage method using the WebClient
    const result = await client.chat.deleteScheduledMessage({
      channel: channelId,
      scheduled_message_id: messageId,
    });
    console.log('deleteSchduledMessage........', result);
    return {
      err: false,
      msg: result
    };
  } catch (error) {
    console.error(error);
    return {
      err: true,
      msg: error
    };
  }
}

async function assignGameInChannel(client, currentGameData, currentDate, count, channelDetails) {
  try {
    if (!isEmpty(currentGameData)) {
      const allGameId = await findAllActiveGameByChannelId(currentGameData.channel_id);
      const questionMetaId = [];
      for (const game of allGameId) {
        questionMetaId.push(game.question_meta_id);
      }
      const date = moment(currentDate).format('YYYY-MM-DD HH:mm:ss');
      const type = channelDetails.category;
      let questionIds = await excludeSomeQuestionId(questionMetaId, 'category', type, 10);
      console.log('...........Excluded questionMetaId.................', questionMetaId);
      if (isEmpty(questionIds)) {
        await updateGameActiveStatus(channelDetails.id)
        questionIds = await excludeSomeQuestionId([], 'category', type, 10);
      }
      const questionList = await randomizeArray(questionIds, count);
      const userId = channelDetails.user_id;
      const userData = await users.findOne({ where: { id: userId } });
      if (!isEmpty(channelDetails) && !isEmpty(questionList) && !isEmpty(userData)) {
        await gameFlow(client, date, channelDetails, questionList, userData);
      }
    }
  } catch (error) {
    console.log(error);
  }
}


async function saveUserSlackVoteData(client, body, userDetails, selectedQuestionOption, game, channelDetails) {
  console.log(body);
  if (body) {
    const questionId = await findQuestionMasterById(selectedQuestionOption);
    if (!isEmpty(game)) {
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      if (moment(date).isAfter(game.end_at)) {
        return 'Game End';
      }
      console.log(`Channel Details................${JSON.stringify(channelDetails)}`);
      if (!isEmpty(questionId) && !isEmpty(userDetails) && !isEmpty(game)) {
        const userId = get(userDetails.user, 'id', '');
        console.log(`userId...............${JSON.stringify(userDetails.user)}`);
        const isIamMember = filter(channelDetails.teams, (team) => team === userId);
        console.log(`Channel Details......isIamMember..........${JSON.stringify(isIamMember)}`);

        if (isEmpty(isIamMember)) {
          return 'Not in Group';
        }
        const alreadySubmit = await findGameByGameIdAndUserId(game.id, userId);
        if (!isEmpty(alreadySubmit)) {
          return 'Already Submit';
        }
        const allNextGame = await findCountNextScheduledGames(game.end_at, game.channel_id);
        if (allNextGame.length < 2 && !isEmpty(channelDetails.category)) {
          let startAt;
          if (!isEmpty(allNextGame)) {
            startAt = allNextGame[0].start_at;
          } else {
            startAt = game.start_at;
          }
          console.log('........Count of Next Game.....', allNextGame.length);
          const count = 2 - allNextGame.length;
          await assignGameInChannel(client, game, startAt, count, channelDetails);
        }
        return createVoteMeta({
          question_master_id: selectedQuestionOption,
          user_id: userId,
          game_id: game.id,
          channel_id: game.channel_id,
          slack_id: body.user.id
        });
        // await userPollingResult(client, userDetails, questionId, game, channelDetails);
      }
    } else {
      return '';
    }
  }
}

async function postMessage(client, message, block, id, channelId) {
  try {
    let result
    if (!isEmpty(block)) {
      result = await client.chat.postEphemeral({
        token: client.token,
        user: id,
        channel: channelId,
        text: message,
        blocks: block,
      });
    } else {
      result = await client.chat.postEphemeral({
        user: id,
        channel: channelId,
        text: message,
      });
    }
    return {
      err: false, msg: result,
    }
  } catch (err) {
    return {
      err: true, msg: 'Something Went Wrong Please Try again after 2 min',
    }
  }
}

async function buttonActionOfUsers(client, body) {
  try {
    const slackUserId = body.user.id;// user Slack Id
    const userAction = body.actions[0].value;// QuestionMasterId && GameId Comma Sperated
    const splitActionArr = userAction.split(',');
    const selectedQuestionOption = splitActionArr[0];
    const gameId = splitActionArr[1];
    const game = await findGameByGameId(gameId);
    if (!isEmpty(game)) {
      const userDetails = await findRecordBySlackIdAndChannelId(slackUserId, game.channel_id)
      const botUserId = get(userDetails, 'bot_user_id', '');
      if (!isEmpty(userDetails) && !isEmpty(botUserId)) {
        const botId = await slackbots.findOne({
          where: {
            bot_id: botUserId,
          },
        });
        if (!isEmpty(botId)) {
          client = new WebClient(botId.bot_token, {
            logLevel: LogLevel.DEBUG,
          });
          const channelId = game.channel_id;
          const channelDetails = await findChannelById(channelId);
          const results = await saveUserSlackVoteData(client, body, userDetails, selectedQuestionOption, game, channelDetails);
          let msg = '';
          if (results === 'Already Submit') {
            msg = 'Your submission was already Submitted';
            const res = await postMessage(client, msg, '', body.user.id, channelDetails.channel_id);
            return res.msg;
          }
          if (results === 'Game End') {
            msg = 'Game End Thank you for playing wait for the next Game';
            const res = await postMessage(client, msg, '', body.user.id, channelDetails.channel_id);
            return res.msg;
          }
          if (results === 'Not in Group') {
            msg = 'Sorry Not in this Group';
            const res = await postMessage(client, msg, '', body.user.id, channelDetails.channel_id);
            return res.msg;
          }
          if (results) {
            // DB save was successful
            const deadlineMessageId = await findReminderBySlackId(slackUserId, game.scheduled_reminder_id, game.id, DEADLINE_REMINDER);
            const cha = 'D025ZNLHP54';

            const deleteId = await deleteSchduledMessage(client, deadlineMessageId.scheduled_message_id, ch);
            console.log(deleteId, '........deleted');

            if (!isEmpty(deleteId) && deleteId.err) {
              console.log('Error in deleleting deadline message', deleteId.msg)
            }
            msg = 'Your submission was successful';
            const block = await thankYouMessageAfterEveryAction({
              QuestionName: 'Would you Rather!!',
            });
            const res = await postMessage(client, msg, block, body.user.id, channelDetails.channel_id);
            return res.msg;
          } else {
            msg = 'There was an error with your submission';
            const res = await postMessage(client, msg, '', body.user.id, channelDetails.channel_id);
            return res.msg;
          }
        }
      }
    }
  } catch (err) {
    return {
      err: true,
      msg: err
    }
  }
}

app.action('button-action1', async ({ ack, body, client }) => {
  await ack();
  try {
    return buttonActionOfUsers(client, body);
  } catch (error) {
    console.error(error);
    return error;
  }
});

app.action('button-action2', async ({ ack, body, client }) => {
  await ack();
  try {
    return buttonActionOfUsers(client, body);
  } catch (error) {
    console.error(error);
    return error;
  }
});


(async () => {
  const port = 3000;
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
