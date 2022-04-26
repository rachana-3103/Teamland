const {
    errorResponse,
} = require('../../helpers/helpers');

const {
    DATA_DOES_NOT_EXIST,
    NOT_MANAGER
} = require('../../helpers/messages');
const { findManager, findUserById } = require('../../Dao/user');
const { findChannelByUserId, findAllChannelByUserId } = require('../../Dao/Channels');
const { isEmpty } = require('lodash');

async function getUsers(userId) {
    try {
        const userArray = [];
        const users = await findManager(userId);
        if (isEmpty(users)) {
            return {
                err: true,
                msg: NOT_MANAGER
            }
        } else {
            const channel = await findChannelByUserId(users.id);
            if (!isEmpty(channel)) {
                for (const user of channel.teams) {
                    const record = await findUserById(user);
                    const userObj = {
                        name: record.name,
                        email: record.email,
                        role: record.access_level,
                        userGroup: channel.channel
                    };
                    userArray.push(userObj);
                }
            } else {
                return {
                    err: true,
                    msg: DATA_DOES_NOT_EXIST
                }
            }
            return {
                err: false,
                msg: userArray
            };
        }

    } catch (error) {
        console.log(error);
    }
}

async function getAllUserGroup(userId) {
    if(!isEmpty(userId)){
        const allChannel = await findAllChannelByUserId(userId);
        if(!isEmpty(allChannel)){
            const group = []
            for(const channel of allChannel){
                group.push(channel.user_group)
            }
            return {
                err: false,
                msg: group,
            };
        } else {
            return {
                err: false,
                msg: 'No Channel Found'
            };
        }
    }
}

module.exports = {
    getUsers,
    getAllUserGroup,
};
