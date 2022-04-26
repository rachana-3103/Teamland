const { Op } = require('sequelize');
const moment = require('moment');
const { games } = require('../models/index');

async function createGames(data) {
  console.log('Data,of Games', data);
  return games.create(data);
}

async function findGameByGameId(id) {
  return games.findOne({
    where: {
      id,
    },
  });
}
async function checkGameByStartAt(date, channel) {
  return games.findAll({
    where: {
      channel_id: channel.id,
      start_at: {
        [Op.between]: [`${date}`, `${moment(date).add(7, 'days').format('YYYY-MM-DD HH:mm:ss')}`],
      },
    },
  });
}

async function getAllGameGreaterThanCurrentDate(id) {
  return games.findAll({
    where: {
      channel_id: id,
      start_at: {
        [Op.gte]: new Date(),
      },
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
    order: [['start_at', 'desc']],
  });
}

async function findAllGameBetweenTwoDates(date, channelId) {
  return games.findOne({
    where: {
      start_at: {
        [Op.between]: [`${moment(date).format('YYYY-MM-DD 00:00:00')}`, `${moment(date).add(1, 'day').format('YYYY-MM-DD 23:59:59')}`],
        channel_id: channelId,
      },
    },
  });
}

async function updateGameById(colName, colData, gameId) {
  return games.update({
    [`${colName}`]: colData,
  }, {
    where: {
      id: gameId,
    },
  });
}

async function updateScheduledColumn(signUpReminder, webGameReminder, gameId, deadlineReminder = '') {
  return games.update({
    scheduled_web_game_id: webGameReminder,
    scheduled_reminder_id: deadlineReminder,
    scheduled_signup_id: signUpReminder,
  }, {
    where: {
      id: gameId,
    },
  });
}

async function findAllGameByChannelId(id) {
  return games.findAll({
    where: {
      channel_id: id,
    },
  });
}

async function findCountNextScheduledGames(date, channelId) {
  return games.findAll({
    where: {
      start_at: {
        [Op.gte]: date,
      },
      channel_id: channelId,
    },
    order: [['start_at', 'desc']],
  });
}

async function updateChannelByChannelId(newChannel, id) {
  return games.update({
    channel_id: newChannel,
  }, {
    where: {
      id,
    },
  });
}

async function deleteGamesByGameId(id) {
  return games.destroy({
    where: {
      id,
    },
  });
}

async function checkGameAtStartAt(startAt, channelId) {
  return games.findOne({
    where: {
      channel_id: channelId,
      start_at: startAt,
    },
  });
}

async function deleteGameByChannelId(channelId){
  return games.destroy({
    where: {
      channel_id: channelId
    },
  });
}

async function updateGameActiveStatus(channelId){
  return games.update({
    active: false
  },{
    where: {
      channel_id: channelId
    }
  })
}

async function findAllActiveGameByChannelId(id) {
  return games.findAll({
    where: {
      channel_id: id,
      active: true,
    },
  });
}
module.exports = {
  createGames,
  checkGameByStartAt,
  getAllGameGreaterThanCurrentDate,
  findAllGameBetweenTwoDates,
  updateGameById,
  updateScheduledColumn,
  findAllGameByChannelId,
  findGameByGameId,
  findCountNextScheduledGames,
  checkGameAtStartAt,
  deleteGamesByGameId,
  deleteGameByChannelId,
  updateGameActiveStatus,
  findAllActiveGameByChannelId
};
