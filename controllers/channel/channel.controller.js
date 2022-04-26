const { isEmpty } = require('lodash');
const {
  errorResponse,
  successResponse,
} = require('../../helpers/helpers');
const { getUsers, getAllUserGroup } = require('./channel.helper');
const { OPERATION_COMPLETED } = require('../../helpers/messages');

exports.getUsers = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return errorResponse(req, res, 'User Id is Required');
    }

    const users = await getUsers(userId);

    if (users && users.err) {
      return errorResponse(req, res, users.msg, 400);
    }
    return successResponse(req, res, users.msg, OPERATION_COMPLETED);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.getAllUserGroup = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return errorResponse(req, res, 'User Id is Required');
    }
    const users = await getAllUserGroup(userId);

    if (users && users.err) {
      return errorResponse(req, res, users.msg, 400);
    }
    return successResponse(req, res, users.msg, OPERATION_COMPLETED);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
