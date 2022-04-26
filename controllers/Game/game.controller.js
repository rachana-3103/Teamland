const moment = require('moment');
const { isEmpty } = require('lodash');
const {
  users,
} = require('../../models/index');
const { findActiveUsers } = require('../../Dao/user')
const { errorResponse, successResponse, randomizeArray } = require('../../helpers/helpers');
const { auth } = require('../slack/slack.helper');
const { filterDataByColumn, findAllQuesMasterByQuestionId } = require('../../Dao/questionMetadata');
const {
  gameFlow, changeChannelFreq, checkDateByDayCount, getDateAccordingFrequency
} = require('./game.helper');
const {
  findChannelById, findAllChannelByUserId, updateCategory,
} = require('../../Dao/Channels');
const {
  getAllGameGreaterThanCurrentDate, findAllGameBetweenTwoDates, findCountNextScheduledGames
} = require('../../Dao/games');
const {
  OPERATION_COMPLETED, SOMETHING_WENT_WRONG, USER_NOT_EXIST, MANAGER, CHANNEL_NOT_EXIST
} = require('../../helpers/messages');

async function findUserById(userId) {
  return users.findOne({
    where: {
      id: userId,
    },
  });
}

exports.scheduledQuestionForSlackUser = async (req, res) => {
  try {
    let userId;
    let searchColumn;
    let searchData;
    let channelId;
    if (req.body.userId && req.body.channelId) {
      userId = req.body.userId;
      channelId = req.body.channelId;
    } else {
      return errorResponse(req, res, 'userId and channel Id is Mandatory');
    }
    if (req.body.fieldName && req.body.selection) {
      searchColumn = req.body.fieldName || 'category';
      searchData = req.body.selection;
    } else {
      return errorResponse(req, res, 'fieldName and  selection is mandatory');
    }
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization;
    } else {
      return errorResponse(req, res, 'Slack App token is required');
    }
    const currDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const newFreq = await getDateAccordingFrequency(1, currDate); // MONDAY = 1
    const date = moment().subtract(newFreq, 'days').format('YYYY-MM-DD HH:mm:ss');
    const userData = await findUserById(userId);
    const list = await filterDataByColumn(searchColumn, searchData);
    const questions = await randomizeArray(list, 2);
    const channel = await findChannelById(channelId);
    if (userData.id !== channel.user_id) {
      return errorResponse(req, res, 'You are not manager in this channel')
    }
    await updateCategory(searchData, channel.id);
    const GameExit = await findCountNextScheduledGames(date, channel.id);
    if (!isEmpty(GameExit)) {
      const calculateDays = moment(GameExit[GameExit.length - 1].start_at).diff(date, 'days')
      return successResponse(req, res, `One Game is already scheduled after ${calculateDays + 1} days`);
    }
    const client = await auth(token);
    if (!isEmpty(questions) && !isEmpty(channel)) {
      // await deleteGameByChannelId(channel.id)
      const response = await gameFlow(client, date, channel, questions, userData)
      if (response.err) {
        return errorResponse(req, res, response.msg, 400)
      }
      return successResponse(req, res, '', OPERATION_COMPLETED)
    } else {
      return errorResponse(req, res, 'No Questions Bank Found', 400)
    }
  } catch (err) {
    console.error(err);
    return errorResponse(req, res, err);
  }
};

exports.getAllChannelScheduledGames = async (req, res) => {
  try {
    const { userId } = req.body;
    if (isEmpty(userId)) {
      return errorResponse(req, res, 'User id is required');
    }
    const getChannelByUserId = await findAllChannelByUserId(userId);
    console.log('...Date.....', moment().toDate());
    if (!isEmpty(getChannelByUserId)) {
      const getAllGame = [];
      for (const channel of getChannelByUserId) {
        const games = await getAllGameGreaterThanCurrentDate(channel.id);
        if (!isEmpty(games)) {
          getAllGame.push({
            [`${channel.channel}`]: games,
          });
        }
      }
      if (!isEmpty(getAllGame)) {
        return successResponse(req, res, getAllGame, OPERATION_COMPLETED);
      }
      return errorResponse(req, res, 'No Game Found');
    }
    console.log(getChannelByUserId);
  } catch (err) {
    return errorResponse(req, res, err);
  }
};

exports.scheduledQuestionManually = async (req, res) => {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization;
    } else {
      return errorResponse(req, res, 'Slack App token is required');
    }
    const {
      userId, channelId, questionId, date,
    } = req.body;
    if (isEmpty(userId) && isEmpty(channelId) && isEmpty(questionId)) {
      return errorResponse(req, res, 'User, channel and question id and date is required');
    }

    const questionAlreadyExit = await findAllGameBetweenTwoDates(date, channelId);
    if (!isEmpty(questionAlreadyExit)) {
      return errorResponse(req, res, 'One Game is already scheduled');
    }
    const userName = await users.findOne({
      id: userId,
    });
    const questionMaster = await findAllQuesMasterByQuestionId(questionId);
    console.log('..........questionMaster..........', JSON.stringify(questionMaster));

    if (!isEmpty(questionMaster)) {
      const client = await auth(token);
      const channel = await findChannelById(channelId);
      const response = await gameFlow(client, date, channel, questionMaster, userName)
      if (response.err) {
        return errorResponse(req, res, response.msg, 400)
      }
      return successResponse(req, res, '', OPERATION_COMPLETED)
    }
  } catch (err) {
    return errorResponse(req, res, err);
  }
};

exports.getFreeChannel = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isEmpty(userId)) {
      const userChannel = [];
      const userData = await findUserById(userId);
      if (!isEmpty(userData) && userData.access_level === MANAGER) {
        const channels = await findAllChannelByUserId(userData.id);
        // const date = moment().format('YYYY-MM-DD');
        for (const channel of channels) {
          const gameExit = await getAllGameGreaterThanCurrentDate(channel.id);
          userChannel.push({
            channelId: channel.id,
            name: channel.channel,
            slackChannelId: channel.channel_id,
            isGameScheduled: !isEmpty(gameExit),
          });
        }
        return successResponse(req, res, userChannel, OPERATION_COMPLETED);
      }
    }
    return errorResponse(req, res, USER_NOT_EXIST);
  } catch (err) {
    return errorResponse(req, res, err);
  }
};

exports.changeOnGoingGameFrequency = async (req, res) => {
  try {
    const data = req.body;
    if (!req.headers.authorization) {
      return errorResponse(req, res, 'Token Not found');
    }
    const client = await auth(req.headers.authorization);
    if (data.channelId && data.userId && data.frequency) {
      /**
       * user details and channels of users
       * @type {*}
       */
      const userData = await findUserById(data.userId);
      if (isEmpty(userData)) {
        return errorResponse(req, res, USER_NOT_EXIST)
      }
      const channel = await findChannelById(data.channelId);
      if (isEmpty(channel)) {
        return errorResponse(req, res, CHANNEL_NOT_EXIST)
      }
      if (userData.id !== channel.user_id) {
        return errorResponse(req, res, 'You are not manager in this channel')
      }
      /**
       * Get onGoing Game on Channel
       * we need to change the frequency of on going game
       * @type {*}
       */
      const onGoingGameDetails = await getAllGameGreaterThanCurrentDate(channel.id);
      if (!isEmpty(onGoingGameDetails)) {
        /**
         * check current GAME and frequency coming from FE should not similiar
         * @type {number}
         */
        const checkFrequency = await checkDateByDayCount(onGoingGameDetails[0].start_at);
        if (checkFrequency === data.frequency) {
          return errorResponse(req, res, 'Game Already scheduled on this frequency');
        }
        const response = await changeChannelFreq(data.frequency, channel, userData, onGoingGameDetails, client)
        if (response.err) {
          return errorResponse(req, res, response.msg, 400)
        }
        return successResponse(req, res, '', OPERATION_COMPLETED)

      } else {
        return errorResponse(req, res, 'No Game Scheduled for next week');
      }
    } else {
      return errorResponse(req, res, 'Change Frequency, Channel id, UserId is required');
    }
  } catch (err) {
    return errorResponse(req, res, err);
  }
};

exports.getNextGame = async (req, res) => {
  try {
    const { userId } = req.params;
    if (isEmpty(userId)) {
      return errorResponse(req, res, USER_NOT_EXIST);
    }
    const channels = await findAllChannelByUserId(userId);
    if (!isEmpty(channels)) {
      const channelDetails = [];
      const date = moment().format('YYYY-MM-DD HH:mm:ss');
      for (const channel of channels) {
        const findGame = await findCountNextScheduledGames(date, channel.id);
        const teamsArray = channel.teams
        const activeMember = await findActiveUsers(teamsArray)
        if (!isEmpty(findGame)) {
          channelDetails.push({
            channelName: channel.channel,
            nextGame: moment(findGame[findGame.length - 1].start_at).diff(date, 'days') + 1,
            total: teamsArray.length,
            joinMembers: activeMember.length
          });
        }
      }
      return successResponse(req, res, channelDetails, OPERATION_COMPLETED);
    }
  } catch (err) {
    return errorResponse(req, res, SOMETHING_WENT_WRONG);
  }
};
