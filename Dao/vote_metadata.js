const { vote_metadata, users } = require('../models/index');

async function createVoteMeta(data) {
  return vote_metadata.create(data);
}

async function findGameByGameIdAndUserId(gameId, userId) {
  return vote_metadata.findOne({
    where: {
      game_id: gameId,
      user_id: userId,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
}

async function findVoteByPairedUser(userId, channelId, gameId) {
  return vote_metadata.findOne({
    where: {
      user_id: userId,
      channel_id: channelId,
      game_id: gameId
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
}

async function findUsersByGameIdAndQuestionId(gameId, questionId) {
  return vote_metadata.findAll({
    where: {
      game_id: gameId,
      question_master_id: questionId,
    },
    include: [{
      model: users,
      attributes: ['name', 'image']
    }],
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
}

module.exports = {
  createVoteMeta,
  findVoteByPairedUser,
  findGameByGameIdAndUserId,
  findUsersByGameIdAndQuestionId,
};
