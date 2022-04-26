const { records, users } = require('../models/index');
const { Op } = require('sequelize')

async function createRecord(data) {
  return records.create(data);
}

async function findRecordByChannelId(channelId) {
  return records.findAll({
    where: {
      channel_id: channelId,
    },
  });
}

async function findRecordByUserId(userId) {
  return records.findAll({
    where: {
      user_id: userId,
    },
  });
}

async function findUserIdByUserSlackId(slackId) {
  return records.findOne({
    where: {
      slack_id: slackId
    },
    include: [{
      model: users
    }]
  })
}

async function findRecordByChannelIdAndSlackId(channelId, slackId) {
  return records.findAll({
    where: {
      channel_id: channelId,
      slack_id: slackId
    },
  });
}

async function findUserInviteToken(userId) {
  return records.findOne({
    where: {
      user_id: userId,
      [Op.not]: {
        invite_user_token: null
      }
    },
  });
}

async function recordFindByToken(token) {
  return await records.findOne({
    attributes: ['user_id', 'name', 'email'],
    where: {
      invite_user_token: token,
    },
  });
}

async function findByUserInRecords(userId, channelId) {
  return await records.findOne({
    where: {
      user_id: userId,
      channel_id: channelId
    }
  });
}

async function findUserByUserId(userId) {
  return await records.findOne({
    where: {
      user_id: userId,
    }
  });
}

async function findUserBySlackId(slackId) {
  return records.findOne({
    where: {
      slack_id: slackId
    }
  })
}

async function findRecordBySlackIdAndChannelId(slackId, channelId){
  return records.findOne({
    where: {
      slack_id: slackId,
      channel_id: channelId
    },
    include: [{
      model: users
    }]
  })
}

module.exports = {
  findRecordByChannelId,
  findUserIdByUserSlackId,
  findRecordByChannelIdAndSlackId,
  createRecord,
  findUserInviteToken,
  recordFindByToken,
  findByUserInRecords,
  findRecordByUserId,
  findUserByUserId,
  findUserBySlackId,
  findRecordBySlackIdAndChannelId,
}
