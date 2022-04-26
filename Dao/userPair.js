const { userpairs } = require('../models/index');

async function createUserPair(data) {
  return userpairs.create(data);
}

async function findUserPairByChannel(loginId, pairId, channelId, gameId) {
  return userpairs.findOne({
    where: {
      user_login_id: loginId,
      user_pair_id: pairId,
      channel_id: channelId,
      game_id: gameId
    }
  });
}

async function findPairUser(channelId, gameId) {
  return userpairs.findOne({
    where: {
      channel_id: channelId,
      game_id: gameId
    }
  });
}

async function findLoginPairUser(pairId, channelId, gameId) {
  return userpairs.findOne({
    where: {
      user_pair_id: pairId,
      channel_id: channelId,
      game_id: gameId
    }
  });
}

async function findUser(loginId, channelId, gameId) {
  return userpairs.findOne({
    where: {
      user_login_id: loginId,
      channel_id: channelId,
      game_id: gameId
    }
  });
}

async function updateUser(loginId, pairId, channelId, gameId) {
  return userpairs.update({
    user_login: true
  },
    {
      where: {
        user_login_id: loginId,
        user_pair_id: pairId,
        channel_id: channelId,
        game_id: gameId
      }
    });
}

async function updateUserLogin(loginId, pairId, channelId, gameId) {
  return userpairs.update({
    user_pair: true
  },
    {
      where: {
        user_login_id: loginId,
        user_pair_id: pairId,
        channel_id: channelId,
        game_id: gameId
      }
    });
}

async function findOldLoginPair(loginId) {
  return userpairs.findAll({
    where: {
      user_login_id: loginId
    },
    order: [['createdAt', 'desc']],
  });
}

async function findOldPairUser(pairId) {
  return userpairs.findAll({
    where: {
      user_pair_id: pairId,
    },
    order: [['createdAt', 'desc']],
  });
}

module.exports = {
  createUserPair,
  findUserPairByChannel,
  findPairUser,
  findLoginPairUser,
  findUser,
  findOldLoginPair,
  findOldPairUser,
  updateUserLogin,
  updateUser,
}
