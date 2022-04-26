const {
  users,
} = require('../../models');

const {
  successResponse,
  errorResponse,
} = require('../../helpers/helpers');
const { isEmpty } = require('lodash')
const {
  DATA_DOES_NOT_EXIST, TOKEN_NOT_FOUND
} = require('../../helpers/messages');

const { registerWithSlack, userList, userRegister, userLogin, changePassword, forgotPassword, resetPassword } = require('./user.helper');
const { auth } = require('../slack/slack.helper');

exports.register = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };
    const user = await userRegister(param);
    if (!isEmpty(user) && user.err){
      return errorResponse(req, res, user.msg, 400)
    }
    return successResponse(req, res, user);
  } catch (error) {
    console.log(error);
    return errorResponse(req, res, error, 400)
  }
};

exports.registerWithSlack = async (req, res) => {
  try {
    const client = await auth(req.headers.authorization);
    const response = await registerWithSlack(client);
    const data = response;
    return res.send({
      messgae: 'Success',
      data,
    });
  } catch (error) {
    return errorResponse(req, res, error, 400)
  }
}

exports.login = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };
    const user = await userLogin(param);
    if (!isEmpty(user) && user.err){
      return errorResponse(req, res, user.msg, 401)
    }
    return successResponse(req, res, user.msg);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const data = req.body
    if (isEmpty(data)){
      return errorResponse(req, res, 'Something Went Wrong', 400)
    }
    const response = await forgotPassword(data);
    if (!isEmpty(response) && response.err){
      return errorResponse(req, res, response.msg, 400)
    }
    return successResponse(req, res, req.body);
  } catch (error) {
    console.log(error);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const data = req.query.token
    if (isEmpty(data)){
      return errorResponse(req, res, TOKEN_NOT_FOUND, 400)
    }
    const newPass = req.body.newPassword;
    const confirmPass = req.body.confirmedPassword
    if (isEmpty(newPass) && isEmpty(confirmPass)){
      return errorResponse(req, res, 'New And Confirm Password is blank')
    }
    const response = await resetPassword(data, newPass, confirmPass);
    if(!isEmpty(response) && response.err){
      return errorResponse(req, res, response.msg, 400)
    }
    return successResponse(req, res, { message: 'Reset Password Successfully!' });
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const param = req.body;
    const response = await changePassword(param);
    if(!isEmpty(response) && response.err){
      return errorResponse(req, res, response.msg, 400)
    }
    return successResponse(req, res, { message: 'Password changed successfully!!' });
  } catch (error) {
    console.log(error);
  }
}

exports.userList = async (req, res) => {
  try {
    const client = await auth(req.headers.authorization);
    const body = req.body;
    const response = await userList(client, body);
    const data = response;
    return res.send({
      messgae: 'Success',
      data,
    });
  } catch (error) {
    return error;
  }
}

exports.findById = async (req, res) => {
  try {
    const param = { ...req.body, ...req.params, ...req.query };

    const user = await users.findOne({ where: { id: param.id } });

    if (!user) return errorResponse(req, res, DATA_DOES_NOT_EXIST, 400);

    return successResponse(req, res, user);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

exports.profile = async (req, res) => {
  try {
    const data = await users.findOne({ where: { id: req.user.id } });

    if (!data) return errorResponse(req, res, DATA_DOES_NOT_EXIST, 400);

    return successResponse(req, res, data);
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};


