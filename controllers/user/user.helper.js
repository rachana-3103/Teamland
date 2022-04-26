const {
    users,
} = require('../../models');

const {
    generateJWTtoken,
    encrypt,
    comparePassword,
} = require('../../helpers/helpers');

const {
    ALLREADY_REGISTER,
    INVALID_UNAME_PWORD,
    USER_NOT_EXIST,
    OLD_PASSWORD_WRONG,
    INVALID_TOKEN,
    PASSWORD_NOT_MATCH
} = require('../../helpers/messages');

const { findUserById, userUpdateForWeb, passwordEncrypt, findUserByEmail, userFindByRegisterAt,
    findInviteUser, userUpdateByResetToken, updateResetTokensByEmail, userFindByResetToken } = require('../../Dao/user');
const { isEmpty } = require('lodash');
const randomString = require('randomstring');
const EmailTemplates = require('email-templates');
const path = require('path');
const { sendMail } = require('../../helpers/smtp');
const moment = require('moment');

async function forgotPassword(data) {
    const toMail = data.email.toLowerCase();
    const userData = await userFindByRegisterAt(toMail, 'web');
    if (!userData) {
        return {
            err: true,
            msg: USER_NOT_EXIST,
        };
    }
    const templatesDir = path.resolve(__dirname, '..', '..');
    const passwordResetToken = randomString.generate();
    const emailContent = new EmailTemplates({ views: { root: templatesDir } });
    const mailObj = {
        Code: passwordResetToken,
        Name: userData.name,
        Link: `https://app.ourteamland.com/reset-password?token=${passwordResetToken}`,
    };
    const subject = 'Password reset request';
    const body = await emailContent.render('templates/user/forgotPassword.ejs', mailObj);

    sendMail(toMail, subject, body);
    await updateResetTokensByEmail(passwordResetToken, toMail);
    return {
        err: false,
        msg: 'SUCCESS',
    };
}

async function resetPassword(token, newPassword, confirmedPassword) {
    const userData = await userFindByResetToken(token);
    if (!userData) {
        return {
            err: true,
            msg: INVALID_TOKEN,
        }
    }
    if (newPassword !== confirmedPassword) {
        return {
            err: true,
            msg: PASSWORD_NOT_MATCH,
        }
    }
    const password = passwordEncrypt(newPassword);
    await userUpdateByResetToken(password, token);
    return {
        err: false,
        msg: 'SUCCESS',
    };
}

async function userRegister(param) {
    try {
        let user;
        let updateUser = {
            active: true
        };
        const userId = param.userId;
        if (userId) {
            user = await findUserById(userId);
        } else {
            user = await findUserByEmail(param.email);
        }
        const tokenExpireIn = moment().add(process.env.AUTH_TOKEN_EXPIRED, 'minutes');
        let encryptedToken;

        if (isEmpty(user)) {
            const data = await users.create({
                name: param.name,
                email: param.email.toLowerCase(),
                password: param.password || null,
                access_level: param.accessLevel,
                register_at: param.registerAt,
                active: true,
                slack_id: param.slackId || null,
                token: param.token || null,
                image: param.image || null,
            });
            user = await findUserById(data.id);
            encryptedToken = encrypt(generateJWTtoken({ id: user.id, access_level: user.access_level }));

            await users.update({
                auth_token: encryptedToken,
                token_expired: tokenExpireIn
            }, {
                where: {
                    id: user.id
                }
            });
            user = await findUserById(user.id);
            return user;
        }
        if (!isEmpty(user) && user.active) {
            return {
                err: true,
                msg: ALLREADY_REGISTER
            }
        } else if (user && user.active === false) {
            encryptedToken = encrypt(generateJWTtoken({ id: user.id, access_level: user.access_level }));

            if (param.password && param.registerAt === 'web') {
                const pwd = passwordEncrypt(param.password);

                Object.assign(updateUser, {
                    password: pwd,
                    register_at: 'web',
                    auth_token: encryptedToken,
                    token_expired: tokenExpireIn
                });
                await userUpdateForWeb(updateUser, user.id);

            } else if (param.registerAt === 'slack') {
                Object.assign(updateUser, {
                    register_at: 'slack',
                    auth_token: encryptedToken,
                    token_expired: tokenExpireIn
                });
                await userUpdateForWeb(updateUser, user.id);
            } else if (param.token && param.registerAt === 'google') {
                Object.assign({
                    token: param.token,
                    register_at: 'google',
                    auth_token: encryptedToken,
                    token_expired: tokenExpireIn
                });
                await userUpdateForWeb(updateUser, user.id);
            }
            user = await findUserById(user.id);
            return user;
        }
    } catch (error) {
        return {
            err: true,
            msg: error.message
        }
    }
}

async function userLogin(param) {
    try {

        let user = await userFindByRegisterAt(param.email, param.loginAt);
        if (!user) {
            return {
                err: true,
                msg: USER_NOT_EXIST,
            }
        }

        if (param.loginAt === 'web') {
            const password = comparePassword(param.password, user.password);
            if (!password) {
                return {
                    err: true,
                    msg: INVALID_UNAME_PWORD,
                }
            }
        }
        let tokenExpireIn;
        const currentTime = moment();
        if (user.token_expired < currentTime || user.token_expired === null) {
            tokenExpireIn = moment().add(process.env.AUTH_TOKEN_EXPIRED, 'minutes');
        }
        const encryptedToken = encrypt(generateJWTtoken({ id: user.id, access_level: user.access_level }));
        await users.update({
            auth_token: encryptedToken,
            token_expired: tokenExpireIn
        }, {
            where: {
                id: user.id
            }
        });
        user = await userFindByRegisterAt(param.email, param.loginAt);
        const data = {
            user,
        };
        return {
            err: false,
            msg: data
        };
    } catch (error) {
        console.log(error);
        return {
            err: true,
            msg: error,
        }
    }
}

async function changePassword(param) {
    try {
        let password;
        const user = await findInviteUser(param.userId);
        if (isEmpty(user)) {
            return {
                err: true,
                msg: USER_NOT_EXIST
            }
        }
        password = passwordEncrypt(param.oldPassword);
        if (user.password === password) {
            password = passwordEncrypt(param.newPassword);
            const user = { password: password };
            await userUpdateForWeb(user, param.userId);
        } else {
            return {
                err: true,
                msg: OLD_PASSWORD_WRONG,
            }
        }
        return {
            err: false,
            msg: 'SUCCESS',
        }
    } catch (error) {
        console.log(error);
        return {
            err: true,
            msg: error,
        }
    }
}

async function registerWithSlack(client) {
    try {
        const result = await client.users.identity();
        return result;
    } catch (err) {
        console.error(err);
        return err
    }
}

async function userList(client, body) {
    try {
        const result = await client.users.list({
            cursor: body.cursor || '',
            team_id: body.team_id || '',
            limit: body.limit || 50
        });
        return result;
    } catch (err) {
        console.error(err);
        return err;
    }
}

module.exports = {
    userRegister,
    registerWithSlack,
    userList,
    userLogin,
    changePassword,
    forgotPassword,
    resetPassword
};
