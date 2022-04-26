const {
    errorResponse,
} = require('../helpers/helpers');

const {
    UNAUTHORIZED_USER,
    NO_TOKEN_PROVIDED,
    TOKEN_EXPIRED
} = require('../helpers/messages');
const moment = require('moment');
const { findUserByAuthToken } = require('../Dao/user');

exports.authorization = async (req, res, next) => {
    const authToken = req.headers.token;
    const currentTime = moment().utc();

    if (!(req.headers && req.headers.token)) {
        return errorResponse(req, res, NO_TOKEN_PROVIDED, 401);
    }
    const user = await findUserByAuthToken(authToken);

    if (!user) {
        return errorResponse(req, res, UNAUTHORIZED_USER, 401);
    }
    if (user && user.token_expired > currentTime) {
        return next();
    }
    if (user && user.token_expired < currentTime) {
        return errorResponse(req, res, TOKEN_EXPIRED, 401);
    }
}


exports.singleKeyAuthorization = async (req, res, next) => {
    const authToken = req.headers.token;
    if (authToken === 'HJI-C18185B0-E889-47BB-9371-8D1D51E68362') {
        return next();
    } else {
        return errorResponse(req, res, UNAUTHORIZED_USER, 400);
    }
}
