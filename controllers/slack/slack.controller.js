const { isEmpty, get } = require('lodash');
const {
  auth, slackUsersList, slackChannels, saveListOfSlackUser,
  slackChannelMembers, slackIndividualUserInfo, slackChannelInfo,
  syncWithSlack, inviteSlackBotByUserId
} = require('./slack.helper');
const { channels } = require('../../models/index');
const { findDistinctDataByCategory } = require('../../Dao/questionMaster');
const {
  successResponse,
  errorResponse,
} = require('../../helpers/helpers');
const { findUserById, updateUsersDetails, findInviteUser } = require('../../Dao/user');
const { findRecordByChannelIdAndSlackId, createRecord, recordFindByToken } = require('../../Dao/Records');
const { updateTeamArrayByChannelUuid } = require('../../Dao/Channels');
const {
  INVALID_TOKEN,
  ALLREADY_REGISTER,
  CHANNEL_ALREADY_ASSIGNED, OPERATION_COMPLETED, SOMETHING_WENT_WRONG, SUCCESS, USER_NOT_EXIST, CHANNEL_NOT_EXIST
} = require('../../helpers/messages');

exports.slackUserList = async (req, res) => {
  try {
    const client = await auth(req.headers.authorization);
    const result = await slackUsersList(client);
    const totalList = [];
    for (const member of result.members) {
      const userList = await saveListOfSlackUser(member);
      totalList.push(userList);
    }
    res.json(totalList);
  } catch (err) {
    console.error(err);
  }
};

exports.slackChannelList = async (req, res) => {
  try {
    const client = await auth(req.headers.authorization);
    const result = await slackChannels(client);
    if (!isEmpty(result) && result.err) {
      return errorResponse(req, res, result.msg)
    }
    return successResponse(req, res, result.msg.channels, OPERATION_COMPLETED)
  } catch (err) {
    console.error(err);
    return errorResponse(req, res, err)
  }
};

async function saveChannelDetail(userId, channelId, client, channelGroupName= '') {
  try {
    const channelResult = await slackChannelInfo(client, channelId);
    if (!isEmpty(channelResult) && channelResult.err) {
      return channelResult
    }
    const { channel } = channelResult.msg;

    // save channel Id in database
    let result = await channels.findOne({
      where: {
        channel_id: channelId,
        user_id: userId,
      },
    });
    const channelData = await channels.findOne({
      where: {
        channel_id: channelId,
      },
    });
    let createNewChannel
    if (channel && !result && !channelData) {
      createNewChannel = await channels.create({
        user_id: userId,
        channel: channel.name,
        channel_id: channelId,
        user_group: channelGroupName
      });

    }

    if (!result && channelData) {
      return {
        err: true, msg: CHANNEL_ALREADY_ASSIGNED
      }
    }
    return !isEmpty(result) ? {
      err: false, msg: result
    } : {
      err: false, msg: createNewChannel
    };
  } catch (err) {
    return {
      err: true, msg: err,
    }
  }
}

async function updateUserDetails(colName, updatedData, userDetails) {
  if (isEmpty(userDetails[`${colName}`])) {
    await updateUsersDetails(colName, updatedData, userDetails.id);
  }
}
exports.userListByChannelId = async (req, res) => {
  try {
    const client = await auth(req.headers.authorization);
    const data = req.body;
    if (isEmpty(data.channel)) {
      return errorResponse(req, res, 'Slack Channel Id is required')
    }
    if (isEmpty(data.id)) {
      return errorResponse(req, res, USER_NOT_EXIST)
    }
    const channelId = req.body.channel;
    const userId = req.body.id;
    const channelGroupName = data.userGroup
    const userDetails = await findUserById(userId);
    const channelMemeber = [];
    if (!isEmpty(userDetails)) {
      const channelRes = await saveChannelDetail(userId, channelId, client, channelGroupName);
      if (!isEmpty(channelRes) && channelRes.err) {
        return errorResponse(req, res, channelRes.msg, 400)
      }
      const botChannelJoin = await inviteSlackBotByUserId(client, channelId)
      if(!isEmpty(botChannelJoin) && botChannelJoin.err){
        return errorResponse(req, res, botChannelJoin.msg, 401)
      }
      const channelData = channelRes.msg
      const membersData = await slackChannelMembers(client, req.body.channel);
      for (const members of membersData.members) {
        const initialResult = await slackIndividualUserInfo(client, members);
        if (!isEmpty(initialResult) && initialResult.err) {
          return errorResponse(req, res, initialResult.msg, 400)
        }
        const result = initialResult.msg
        const userSlackProfile = result.user;
        if (userSlackProfile.profile.email === userDetails.email) {
          const userSlackId = userSlackProfile.id;
          const userImage = userSlackProfile.profile.image_48;
          await updateUserDetails('slack_id', userSlackId, userDetails);
          await updateUserDetails('image', userImage, userDetails);
          let record;
          const isRecordAlreadyExist = await findRecordByChannelIdAndSlackId(channelData.id, userSlackId);
          if (isEmpty(isRecordAlreadyExist)) {
            record = await createRecord({
              name: userDetails.name,
              email: userDetails.email,
              user_id: userDetails.id,
              slack_id: userSlackId,
              channel_id: channelData.id,
              bot_user_id: get(userDetails, 'bot_user_id', '')
            });
          } else {
            record = isRecordAlreadyExist;
          }
          if (!isEmpty(record)) {
            const teamsRecords = channelData.teams;
            if (!teamsRecords.includes(userDetails.id)) {
              teamsRecords.push(userDetails.id);
              await updateTeamArrayByChannelUuid(channelData.id, teamsRecords)
            }
          }
        }
        channelMemeber.push(result);
      }
      res.json({
        channelMemeber,
        channelId,
      });
    } else {
      return errorResponse(req, res, USER_NOT_EXIST, 400)
    }
  } catch (err) {
    return errorResponse(req, res, err)
  }
};

exports.saveChannelUserList = async (req, res) => {
  try {
    const data = req.body;
    if (isEmpty(data.userSlackId)) return errorResponse(req, res, 'Users Slack Id is required')
    if (isEmpty(data.channelId)) return errorResponse(req, res, CHANNEL_NOT_EXIST, 400)
    const client = await auth(req.headers.authorization);
    if (data.userSlackId && data.channelId) {
      for (const id of data.userSlackId) {
        const initialResult = await slackIndividualUserInfo(client, id);
        if (!isEmpty(initialResult) && initialResult.err) {
          return errorResponse(req, res, initialResult.msg, 400)
        }
        const member = initialResult.msg
        if (member.user) {
          const dataValue = await saveListOfSlackUser(client, member.user, data.channelId, data.botId);
          if (dataValue.err) {
            return errorResponse(req, res, dataValue.msg, 400)
          }
        }
      }
    }
    return successResponse(req, res, SUCCESS, OPERATION_COMPLETED)
  } catch (err) {
    console.error(err);
    return errorResponse(req, res, err)
  }
};

exports.syncWithSlack = async (req, res) => {
  try {
    const data = req.body;
    const result = await syncWithSlack(data);
    if (!isEmpty(result) && result.err) {
      return errorResponse(req, res, result.msg, 400)
    }
    return successResponse(req, res, result.msg, OPERATION_COMPLETED)
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, SOMETHING_WENT_WRONG, 400);
  }
};

exports.inviteUser = async (req, res) => {
  try {
    let user;
    const token = req.query.token;
    const record = await recordFindByToken(token);
    if (!isEmpty(record)) {
      user = await findInviteUser(record.user_id);
    }
    if (!isEmpty(user)) {
      return errorResponse(req, res, ALLREADY_REGISTER, 400);
    }
    if (!isEmpty(record) && isEmpty(user)) {
      return successResponse(req, res, record);
    }
    if (!record) {
      return errorResponse(req, res, INVALID_TOKEN, 400);
    }
  } catch (error) {
    console.log(error);
  }
};

exports.getAllDistintCategory = async (req, res) => {
  try {
    const values = await findDistinctDataByCategory();
    const data = [];
    if (!isEmpty(values)) {
      for (const value of values) {
        const str = value.DISTINCT
        const result = str.charAt(0).toUpperCase() + str.slice(1);
        data.push(result);
      }
    }
    return successResponse(req, res, data, OPERATION_COMPLETED);
  } catch (err) {
    return errorResponse(req, res, SOMETHING_WENT_WRONG, 400);
  }
};
