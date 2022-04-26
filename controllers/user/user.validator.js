const {
  errorResponse,
} = require('../../helpers/helpers');

const {
  INVALID_PARAMS
} = require('../../helpers/messages');

exports.registerValidator = async (req, res, next) => {
  const param = { ...req.body, ...req.params, ...req.query };
  let allowedParams = ['registerAt'];
  let requiredParams = ['registerAt'];
  let failed = false;
  if (param.userId) {
    if (param.registerAt === 'web') {
      allowedParams.push('password', 'userId');
      requiredParams.push('password', 'userId');
    } else if (param.registerAt === 'slack') {
      allowedParams.push('userId');
      requiredParams.push('userId');
    } else {
      allowedParams.push('token', 'userId');
      requiredParams.push('token', 'userId');
    }
  } else {
    if (param.registerAt === 'web') {
      allowedParams.push('name', 'email', 'accessLevel', 'password');
      requiredParams.push('name', 'email', 'accessLevel', 'password');
    } else if (param.registerAt === 'slack') {
      allowedParams.push('name', 'email', 'accessLevel', 'slackId', 'image');
      requiredParams.push('name', 'email', 'accessLevel', 'slackId');
    } else {
      allowedParams.push('name', 'email', 'accessLevel', 'token', 'image');
      requiredParams.push('name', 'email', 'accessLevel', 'token');
    }
  }

  Object.keys(param).forEach((element) => {
    if (!allowedParams.includes(element)) failed = true;
  });

  requiredParams.forEach((element) => {
    if (!param[element]) failed = true;
  });

  if (failed) return errorResponse(req, res, INVALID_PARAMS, 400);
  return next();
};

exports.loginValidator = async (req, res, next) => {
  const param = { ...req.body, ...req.params, ...req.query };

  let failed = false;
  let allowedParams = ['loginAt', 'email'];
  let requiredParams = ['loginAt', 'email'];

  if (param.loginAt === 'web') {
    allowedParams.push('password');
    requiredParams.push('password');
  };

  Object.keys(param).forEach((element) => {
    if (!allowedParams.includes(element)) failed = true;
  });

  requiredParams.forEach((element) => {
    if (!param[element]) failed = true;
  });
  if (failed) return errorResponse(req, res, INVALID_PARAMS, 400);
  return next();
};
