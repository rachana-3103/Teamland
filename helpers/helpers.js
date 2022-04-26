const jwt = require('jsonwebtoken');
const SimpleCrypto = require('simple-crypto-js').default;
const crypto = require('crypto');

const {
  SOMETHING_WENT_WRONG,
  OPERATION_COMPLETED,
} = require('./messages');

exports.successResponse = (req, res, data, message = OPERATION_COMPLETED, code = 200) => {
  res.status(code);
  res.send({
    code,
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (req, res, message = SOMETHING_WENT_WRONG, code = 500) => {
  res.status(code);
  res.send({
    code,
    success: false,
    message,
    data: null,
  });
};

exports.generateJWTtoken = (object, secretKey = process.env.JWT_SECRET) => jwt.sign(JSON.parse(JSON.stringify(object)), secretKey, { expiresIn: process.env.AUTH_TOKEN_EXPIRED });

exports.decrypt = (text) => {
  const simpleCrypto = new SimpleCrypto(process.env.ENCRYPTION_KEY);
  const chiperText = simpleCrypto.decrypt(text);
  return chiperText;
};

exports.encrypt = (text) => {
  const simpleCrypto = new SimpleCrypto(process.env.ENCRYPTION_KEY);
  const chiperText = simpleCrypto.encrypt(text);
  return chiperText;
};

exports.comparePassword = (paramPass, dbPass) => {
  const password = crypto
    .createHash('md5')
    .update(paramPass)
    .digest('hex');

  if (password === dbPass) {
    return true;
  }
  return false;
};

exports.randomizeArray = (arr, count) => {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);
    // get random item
    const item = arr[randomIndex];
    // removed the selected item from an array
    arr.splice(randomIndex, 1);
    result.push(item);
  }
  return result;
};
