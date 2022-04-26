const {
    userPairFind, guessOption
} = require('./userPairing.helper');
const { successResponse, errorResponse } = require('../../helpers/helpers');
const {
    OPERATION_COMPLETED
} = require('../../helpers/messages');

exports.userPair = async (req, res) => {
    try {
        const userPairData = await userPairFind(req.body.userId);
        if (userPairData && userPairData.err) {
            return errorResponse(req, res, userPairData.msg, 400)
        }
        return successResponse(req, res, userPairData.msg, OPERATION_COMPLETED);
    } catch (err) {
        console.error(err);
    }
};

exports.guessOption = async (req, res) => {
    try {
        const { userPairId, channelId, userLoginId, gameId } = req.body;
        const guessOptionData = await guessOption(userPairId, channelId, userLoginId, gameId);
        if (guessOptionData && guessOptionData.err) {
            return errorResponse(req, res, guessOption.msg, 400);
        }
        return successResponse(req, res, '', OPERATION_COMPLETED);
    } catch (error) {
        console.error(err);
    }
}
