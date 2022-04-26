const { WebClient, LogLevel } = require('@slack/web-api');
const { isEmpty, get } = require('lodash');
const randomString = require('randomstring');
const {
  slackbots, users,
} = require('../../models/index');
const { findUserBySlackId, newUserCreate, findUserById } = require('../../Dao/user');
const { findRecordByChannelIdAndSlackId, createRecord, findUserInviteToken } = require('../../Dao/Records');
const { findChannelByChannelId, updateTeamArrayByChannelUuid } = require('../../Dao/Channels');
const { USER, CHANNEL_NOT_EXIST } = require('../../helpers/messages');
const { signUpRemainderBlock } = require('../../helpers/design');

/**
* Initialze http web api with slack bot token
* @param client
* @param channelId
* @returns {Promise<WebAPICallResult & {ok?: boolean, channel?: Channel, error?: string, needed?: string, provided?: string}>}
*/

async function auth(token) {
  let authToken;
  if (token && token.length > 40 && token.length <= 80) {
    authToken = token;
  } else {
    const result = await slackbots.findOne({
      where: {
        bot_id: token,
      },
    });
    authToken = result.bot_token;
  }
  const client = await new WebClient(authToken, {
    logLevel: LogLevel.DEBUG,
  });
  try {
    return client;
  } catch (err) {
    console.log(err);
    return {
      error: true,
      msg: err,
    };
  }
}

async function saveListOfSlackUser(client, member, channelId, botId) {
  const user = [];
  let userInviteToken;
  const findChanelBySlakChannelId = await findChannelByChannelId(channelId);
  if (isEmpty(findChanelBySlakChannelId)) {
    return {
      err: true,
      msg: CHANNEL_NOT_EXIST,
    };
  }
  const channelManager = await findUserById(findChanelBySlakChannelId.user_id);
  if (!member.profile.bot_id && member.name !== 'slackbot' && member.profile.email !== channelManager.email) {
    const userSlackId = member.id;
    const slacKProfileName = member.profile.real_name;
    const emailId = member.profile.email ? member.profile.email : '';
    const userImage = member.profile.image_48;
    const findUser = await findUserBySlackId(userSlackId, emailId);
    let userRecord;
    if (isEmpty(findUser)) {
      userRecord = await newUserCreate({
        name: slacKProfileName,
        email: emailId,
        access_level: USER,
        active: false,
        slack_id: userSlackId,
        bot_user_id: channelManager.bot_user_id,
        image: userImage,
        register_at: 'web',
        on_board: false,
      });
    } else {
      userRecord = findUser;
    }
    const commonInviteToken = await findUserInviteToken(userRecord.id);
    let record;
    const channelUuid = findChanelBySlakChannelId.id;
    const findRecordAlreadyExit = await findRecordByChannelIdAndSlackId(channelUuid, userSlackId);
    if (isEmpty(findRecordAlreadyExit)) {
      if (!isEmpty(commonInviteToken)) {
        userInviteToken = commonInviteToken.invite_user_token;
      } else {
        userInviteToken = randomString.generate();
      }
      record = await createRecord({
        name: slacKProfileName,
        email: emailId,
        user_id: userRecord.id,
        slack_id: userSlackId,
        channel_id: channelUuid,
        invite_user_token: userInviteToken,
        bot_user_id: channelManager.bot_user_id
      });
    } else {
      record = findRecordAlreadyExit[0];
      userInviteToken = record.invite_user_token;
    }
    if (!isEmpty(record)) {
      const { teams } = findChanelBySlakChannelId;
      if (!teams.includes(userRecord.id)) {
        teams.push(userRecord.id);
        await updateTeamArrayByChannelUuid(channelUuid, teams);
      }
    }
    const block = await signUpRemainderBlock(userInviteToken);
    await client.chat.postMessage({
      channel: userSlackId,
      blocks: block,
      text: 'Sign Up Reminder'
    });
    user.push({
      userSlackId, slacKProfileName, emailId,
    });
  }
  return {
    err: false,
    msg: user,
  };
}

/**
* Get All User list of the slack including bot also
* @param client
* @param channelId
* @returns {Promise<WebAPICallResult & {ok?: boolean, channel?: Channel, error?: string, needed?: string, provided?: string}>}
*/

async function slackUsersList(client) {
  try {
    const result = await client.users.list();
    return result;
  } catch (err) {
    console.error(err);
  }
}

/**
* Get All channel list of the slack
* @param client
* @param channelId
* @returns {Promise<WebAPICallResult & {ok?: boolean, channel?: Channel, error?: string, needed?: string, provided?: string}>}
*/

async function slackChannels(client) {
  try {
    const result = await client.conversations.list();
    return {
      err: false,
      msg: result,
    };
  } catch (err) {
    console.error(err);
    return {
      err: true,
      msg: `${err.data.error}`,
    };
  }
}

/**
* Get All members of the channel with channel Id
* @param client
* @param channelId
* @returns {Promise<WebAPICallResult & {ok?: boolean, channel?: Channel, error?: string, needed?: string, provided?: string}>}
*/

async function slackChannelMembers(client, channelId) {
  try {
    const result = await client.conversations.members({
      channel: channelId,
    });
    return result;
  } catch (err) {
    console.error(err);
    return err;
  }
}

/**
* Get specific User Information with User Slack Id
* @param client
* @param channelId
* @returns {Promise<WebAPICallResult & {ok?: boolean, channel?: Channel, error?: string, needed?: string, provided?: string}>}
*/
async function slackIndividualUserInfo(client, userSlackId) {
  try {
    const result = await client.users.info({
      user: userSlackId,
    });
    return {
      err: false, msg: result,
    };
  } catch (err) {
    console.error(err);
    return {
      err: true, msg: `${err.data.error}`,
    };
  }
}

/**
* Get specific slack channel Information with channel Id
* @param client
* @param channelId
* @returns {Promise<WebAPICallResult & {ok?: boolean, channel?: Channel, error?: string, needed?: string, provided?: string}>}
*/
async function slackChannelInfo(client, channelId) {
  try {
    const result = await client.conversations.info({
      channel: channelId,
    });
    return {
      err: false,
      msg: result,
    };
  } catch (err) {
    console.error(err);
    return {
      err: true, msg: `${err.data.error}`,
    };
  }
}

async function syncWithSlack(body) {
  try {
    const {
      botUserId, accessToken, UserToken, userId,
    } = body;
    const data = {
      bot_id: botUserId,
      bot_token: accessToken,
      bot_user_token: UserToken,
      signing_secret: '4338876fc7222a53d5510b05b89667ee',
      app_token: 'xapp-1-A025KCT1KML-2264433107589-d6654e0742ba934af1d28e4180d3bda6ca158df494f30c48a1006480a507d7fd',
    };
    let slackData;
    slackData = await slackbots.findOne({
      attributes: ['bot_id', 'bot_token', 'bot_user_token'],
      where: {
        bot_id: botUserId,
      },
    });

    if (isEmpty(slackData)) {
      slackData = await slackbots.create(data);
      await users.update({
        bot_user_id: data.bot_id,
      }, {
        where: {
          bot_user_id: null,
          id: userId,
        },
      });
    }
    return {
      err: false,
      msg: slackData,
    };
  } catch (err) {
    console.error(err);
    return {
      err: true, msg: err,
    };
  }
}

async function inviteUserToSlackChannel(client, slackChannelId, slackToken) {
  try {
    const result = await client.conversations.join({
      token: slackToken,
      channel: slackChannelId
    });
    return {
      err: false,
      msg: result,
    };
  } catch (err) {
    return {
      err: true, msg: `${err.data.error}`,
    };
  }
}

async function inviteSlackBotByUserId(client, channelId) {
  const { token } = client;
  if (!isEmpty(channelId) && !isEmpty(token)) {
    return inviteUserToSlackChannel(client, channelId, token);
  }
}

module.exports = {
  auth,
  slackUsersList,
  saveListOfSlackUser,
  slackChannels,
  slackChannelMembers,
  slackIndividualUserInfo,
  slackChannelInfo,
  syncWithSlack,
  inviteSlackBotByUserId,
};
