const { Op } = require('sequelize');
const { channels, users } = require('../models/index');

async function findChannelById(id) {
  return channels.findOne({
    where: {
      id,
    },
  });
}

async function findChannelByUserId(userId) {
  return channels.findOne({
    where: {
      user_id: userId,
    },
  });
}

async function findAllChannelByUserId(userId) {
  return channels.findAll({
    where: {
      user_id: userId,
    },
  });
}

async function updateCategory(data = [], id) {
  return channels.update({
    category: data,
  }, {
    where: {
      id,
    },
  });
}
async function findChannelByChannelId(id) {
  return channels.findOne({
    where: {
      channel_id: id,
    },
  });
}

async function updateTeamArrayByChannelUuid(id, teams) {
  return channels.update(
    { teams },
    {
      where: {
        id
      }
    });
}


module.exports = {
  findChannelById,
  findChannelByUserId,
  findAllChannelByUserId,
  updateCategory,
  findChannelByChannelId,
  updateTeamArrayByChannelUuid
};
