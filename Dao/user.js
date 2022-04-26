const crypto = require('crypto');
const { Op } = require('sequelize');
const { users } = require('../models/index');

async function newUserCreate(data) {
  return users.create(data);
}

async function userUpdateForWeb(user, id) {
  return await users.update(user, {
    where: {
      id
    }
  })
}

async function findUserByAuthToken(token) {
  return await users.findOne({
    where: {
      auth_token: token,
      active: true
    },
  });
}

async function updateResetTokensByEmail(resetToken, email) {
  return await users.update({
    reset_token: resetToken,
  }, {
    where: {
      email: email.toLowerCase(),
    },
  });
}

async function userFindByRegisterAt(email, loginAt) {
  return await users.findOne({
    where: {
      email: email.toLowerCase(),
      register_at: loginAt,
      active: true
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
}

async function findManager(id) {
  return await users.findOne({
    attributes: ['id', 'name', 'email', 'access_level'],
    where: {
      id,
      access_level: 'manager'
    }
  });
}

async function userUpdateByResetToken(password, token) {
  return await users.update({
    password,
  }, {
    where: {
      reset_token: token,
    },
  });
}

async function userFindByResetToken(token) {
  return await users.findOne({
    where: {
      reset_token: token,
      register_at: 'web',
    },
  });
}

async function findInviteUser(userId) {
  return await users.findOne({
    where: {
      id: userId,
      active: true
    }
  });
}

async function findUserByEmail(email) {
  return await users.findOne({
    where: {
      email: email.toLowerCase()
    }
  });
}

async function findUserBySlackId(slackId, emailId) {
  return users.findOne({
    where: {
      slack_id: slackId,
      email: emailId
    },
  });
}

async function findUserById(userId) {
  return users.findOne({
    where: {
      id: userId
    },
    attributes: {
      exclude: ['password', 'createdAt', 'updatedAt'],
    },
  })
}

async function updateUsersDetails(colName, colDetails, id) {
  return users.update({
    [`${colName}`]: colDetails
  }, {
    where: {
      id
    }
  })
}

async function updateUsersByEmail(colName, colDetails, email) {
  return users.update({
    [`${colName}`]: colDetails
  }, {
    where: {
      email
    }
  })
}

function passwordEncrypt(password) {
  const pwd = crypto
    .createHash('md5')
    .update(password)
    .digest('hex');
  return pwd;
}

async function findActiveUsers(userList = []) {
  return users.findAll({
    where: {
      id: {
        [Op.in]: userList
      },
      active: true
    }
  })
}


module.exports = {
  newUserCreate,
  updateResetTokensByEmail,
  findUserBySlackId,
  findUserById,
  updateUsersDetails,
  userUpdateForWeb,
  passwordEncrypt,
  findUserByEmail,
  findInviteUser,
  userFindByRegisterAt,
  updateUsersByEmail,
  userFindByResetToken,
  userUpdateByResetToken,
  findActiveUsers,
  findManager,
  findUserByAuthToken
};
