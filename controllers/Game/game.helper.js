const { map, isEmpty } = require('lodash');
const moment = require('moment');
const randomString = require('randomstring');
const { DEADLINE_REMINDER } = require('../../helpers/messages')
const {
  questionCreateBlock, makeMoveBeforeDeadline, signUpRemainderBlock, gameOfDayInTeamLand,
} = require('../../helpers/design');
const {
  createGames, updateGameById, updateScheduledColumn, findAllGameByChannelId, deleteGamesByGameId, checkGameAtStartAt, findCountNextScheduledGames,
} = require('../../Dao/games');
const { findRecordByChannelId, findByUserInRecords } = require('../../Dao/Records');
const { findAllQuesMasterByQuestionIds } = require('../../Dao/questionMetadata');
const { createReminderWithType } = require('../../Dao/reminders');
const { findChannelById } = require('../../Dao/Channels');

async function scheduledPostMessage(client, record, block, textMess, unixDate) {
  try {
    return client.chat.scheduleMessage({
      channel: record.slack_id,
      text: textMess,
      blocks: block,
      // Time to post message, in Unix Epoch timestamp format
      post_at: unixDate,
    });
  } catch (err) {
    return err;
  }
}

async function deleteSchduledMessage(client, messageId, channelId = 'C02698U65PT') {
  try {
    // Call the chat.deleteScheduledMessage method using the WebClient
    const result = await client.chat.deleteScheduledMessage({
      channel: channelId,
      scheduled_message_id: messageId,
    });
    console.log('deleteSchduledMessage........', result);
    return result;
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function checkDateByDayCount(date) {
  const currDate = new Date(date);
  return currDate.getDay();
}

async function webParingGameScheduled(date, client, channel) {
  try {
    const slackChannelId = channel.channel_id;
    const record = {
      slack_id: slackChannelId,
    };
    console.log('webParingGameScheduled....date', date);
    const unixDate = moment(date).unix();
    const block = await gameOfDayInTeamLand();
    const result = await scheduledPostMessage(client, record, block, 'TeamLand Play', unixDate);
    return {
      err: false,
      msg: result.scheduled_message_id,
    }
  } catch (err) {
    return {
      err: true,
      msg: `${err.data.error}`,
    };
  }
}

async function signUpReminder(client, date, channel) {
  try {
    let reminderDate;
    let record;
    let result;
    let userRecord;
    const today = new Date();
    const getDay = today.getDay();
    if (getDay === 1 || moment(date).isSameOrAfter(today)) {
      for (const userId of channel.teams) {
        userRecord = await findByUserInRecords(userId, channel.id);
        record = {
          slack_id: userRecord.slack_id,
        };
        reminderDate = moment(date).subtract(1, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const unixDate = moment(reminderDate).unix();
        const block = await signUpRemainderBlock(userRecord.invite_user_token);
        result = await scheduledPostMessage(client, record, block, 'Sign Up Reminder', unixDate);
        result = result.scheduled_message_id;
      }
    }
    return {
      err: false,
      msg: !isEmpty(result) ? result : 'NA'
    };
  } catch (err) {
    return {
      err: true,
      msg: `${err.data.error}`,
    };
  }
}

async function setFormatForScheduledQuestion(userName, startAt, endAt, question) {
  const data = {
    text: question.question,
    name: userName,
    startAt,
    endAt,
  };
  map(question.question_masters, (ques) => {
    if (ques && ques.option !== 'main-content' && !data.optionA) {
      data.optionA = ques.option;
      data.optionAId = ques.id;
    }
    if (ques && ques.option !== 'main-content' && data.optionA) {
      data.optionB = ques.option;
      data.optionBId = ques.id;
    }
    if (ques && ques.option === 'main-content') {
      data.mainContent = ques.image_url;
      data.questionMetadataId = ques.question_id;
      data.category = ques.category;
    }
  });
  return data;
}

async function scheduleMessage(data, channelId, slackChannelId, client) {
  if (!isEmpty(data)) {
    const gameId = [];
    const originalGameId = []
    try {
      for (const val of data) {
        const date = moment(val.startAt).unix();
        const resData = await createGames({
          start_at: val.startAt,
          end_at: val.endAt,
          question_meta_id: val.questionMetadataId,
          channel_id: channelId,
          active: true,
        });
        originalGameId.push(resData.id)
        const block = await questionCreateBlock({
          text: val.text,
          name: val.name,
          mainContent: val.mainContent,
          category: val.category,
          optionA: val.optionA,
          optionB: val.optionB,
          optionAId: val.optionAId,
          optionBId: val.optionBId,
          GameId: resData.id,
        });
        const result = await client.chat.scheduleMessage({
          channel: slackChannelId,
          text: 'Game Of The Day',
          blocks: block,
          post_at: date,
        });
        console.log('scheduleMessage...........Result.........', result);
        await updateGameById('scheduled_message_id', result.scheduled_message_id, resData.id);
        gameId.push(resData.id);
      }
      return {
        err: false,
        msg: gameId,
      };
    } catch (err) {
      await deleteGamesByGameId(originalGameId[0]);
      return {
        err: true,
        msg: `${err.data.error}`,
      };
    }
  }
}

async function moveBeforeDeadline(channelId, date, client, gameId) {
  try {
    const userRecords = await findRecordByChannelId(channelId);
    const commonString = randomString.generate();
    if (!isEmpty(userRecords)) {
      const scheduledDate = moment(date).add(2, 'minutes').format('YYYY-MM-DD HH:mm:ss');
      console.log('moveBeforeDeadline.........scheduledDate', scheduledDate);
      const unixDate = moment(scheduledDate).unix();
      userRecords.map(async (record) => {
        const block = await makeMoveBeforeDeadline({ name: record.name });
        const result = await scheduledPostMessage(client, record, block, 'Reminder Message', unixDate);
        if (!isEmpty(gameId)) {
          await createReminderWithType({
            type: DEADLINE_REMINDER,
            common_id: commonString,
            scheduled_message_id: result.scheduled_message_id,
            game_id: gameId.msg[0],
            slack_id: record.slack_id
          });
        }
      });
      console.log('.........12Hr Reminder Messgae for Team Members...END', commonString, result);
      return {
        err: false,
        msg: commonString
      }
    }
  } catch (err) {
    return {
      err: true,
      msg: `${err.data.error}`,
    };
  }
}

async function gameFlow(client, date, channel, questions, userData) {
  for (const question of questions) {
    let startDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
    let addDays = 7;
    startDate = moment(startDate).add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment(startDate).add(3, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    date = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
    const scheduledList = await setFormatForScheduledQuestion(userData.name, startDate, endDate, question);
    const gameId = await scheduleMessage([scheduledList], channel.id, channel.channel_id, client);
    console.log('........GAME ID OF GAME FLOW.......', gameId)
    if (!isEmpty(gameId) && gameId.err) {
      return gameId
    }
    /**
     * SignUp Reminder for every List Question
     * findDate is saturday and sunday scheduled the question on monday
     * findDate is friday then scheduled the question on thursday
     * @type {string}
     */
    if (!isEmpty(gameId)) {
      const signUpId = await signUpReminder(client, startDate, channel)
      if (!isEmpty(signUpId) && signUpId.err) {
        return signUpId;
      }
      /**
       * 12 Hr Reminder of Game of the day to every slack member
       * channel id help me to fetch all selected channel members and it give slack id
       * so scheduled personal message 12 hr reminder by using slack id
       */
      if (!isEmpty(signUpId)) {
        const deadlineMove = await moveBeforeDeadline(channel.id, startDate, client, gameId);
        if (!isEmpty(deadlineMove) && deadlineMove.err) {
          return deadlineMove
        }
        /**
         * Slack game ended then scheduled the next pairing game to Web portal
         * it will be again scheduled in next 24 hr
         * @type {moment.Moment}
         */
        addDays += 1;
        startDate = moment(startDate).add(3, 'minutes').format('YYYY-MM-DD HH:mm:ss');
        const webGameId = await webParingGameScheduled(startDate, client, channel);
        if (!isEmpty(signUpId.msg) && !isEmpty(webGameId) && !isEmpty(deadlineMove.msg)) {
          await updateScheduledColumn(signUpId.msg, webGameId.msg, gameId.msg, deadlineMove.msg);
        }
      }
    }
  }
  return {
    err: false,
    msg: 'SUCCESS'
  }
}


async function changeOnGoingGame(client, date, oldChannelId, newChannelId, oldChannelData, userData) {
  const oldChannelGames = await findAllGameByChannelId(oldChannelId);
  const nextOldGameIds = [];
  const questionIds = [];
  for (const oldGame of oldChannelGames) {
    if (moment(oldGame.start_at).isAfter(moment())) {
      nextOldGameIds.push(oldGame);
      questionIds.push(oldGame.question_meta_id);
    } else {
      const gameEntryInNewChannel = await checkGameAtStartAt(oldGame.start_at, newChannelId);
      if (isEmpty(gameEntryInNewChannel)) {
        await createGames({
          start_at: oldGame.start_at,
          end_at: oldGame.end_at,
          question_meta_id: oldGame.question_meta_id,
          channel_id: newChannelId,
        });
      }
    }
  }
  const channel = await findChannelById(newChannelId);
  if (!isEmpty(channel)) {
    const questionDetails = await findAllQuesMasterByQuestionIds(questionIds);
    await gameFlow(client, date, channel, questionDetails, userData).then(async (response) => {
      if (!isEmpty(response) && response.err) return response;
      for (const oldGame of nextOldGameIds) {
        console.log(`..........oldChannelData...........${JSON.stringify(oldChannelData)}`);
        await deleteSchduledMessage(oldGame.scheduled_web_game_id, oldChannelData.channel_id);
        await deleteSchduledMessage(oldGame.scheduled_message_id, oldChannelData.channel_id);
        await deleteSchduledMessage(oldGame.scheduled_reminder_id, oldChannelData.channel_id);
        await deleteGamesByGameId(oldGame.id);
      }
    }).catch((err) => {
      throw new Error(err);
    });
  }
}

async function getDateAccordingFrequency(freq, date) {
  const today = await checkDateByDayCount(date);
  return 0;
  /* if (freq === today) {
    return 0;
  }
  if (freq > today) {
    return 7 - freq + today;
  }
  return today - freq; */
}

async function changeChannelFreq(frequency, channel, userData, onGoingGameDetails, client) {
  const today = new Date();
  const allNextGames = await findCountNextScheduledGames(today, channel.id);
  const nextGameDate = allNextGames[allNextGames.length - 1].start_at
  const getExactDate = await getDateAccordingFrequency(frequency, nextGameDate);
  const date = moment(nextGameDate).subtract(getExactDate, 'days').format('YYYY-MM-DD');
  const questionMetaIds = [];

  for (const oldGame of allNextGames) {
    questionMetaIds.push(oldGame.question_meta_id);
  }
  if (!isEmpty(questionMetaIds)) {
    /**
     * schedule all the game according to next Game Frequency
     * delete the Old next game which has diffrent frequencies
     * @type {*}
     */
    const questionDetails = await findAllQuesMasterByQuestionIds(questionMetaIds);
    const response = await gameFlow(client, date, channel, questionDetails, userData)
    if (response.err) {
      return response
    }
    for (const oldGame of allNextGames) {
      console.log(`.changeChannelFreq .oldChannelData....${JSON.stringify(channel)}`);
      await deleteSchduledMessage(client, oldGame.scheduled_web_game_id, channel.channel_id);
      await deleteSchduledMessage(client, oldGame.scheduled_message_id, channel.channel_id);
      await deleteSchduledMessage(client, oldGame.scheduled_reminder_id, channel.channel_id);
      await deleteGamesByGameId(oldGame.id);
    }
  }
}

module.exports = {
  gameFlow,
  checkDateByDayCount,
  changeChannelFreq,
  getDateAccordingFrequency,
};
