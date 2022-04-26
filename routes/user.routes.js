const express = require('express');

const router = express.Router();

const userController = require('../controllers/user/user.controller');
const userValidator = require('../controllers/user/user.validator');
const { authorization } = require('../config/authorization');

// const {
//   authentication,
//   authorization,
// } = require('../middleware/middleware');

router.get('/', (req, res) => {
  res.send({ message: 'Hello World!!' });
});

router.post('/register', userValidator.registerValidator, userController.register);
router.post('/login', userValidator.loginValidator, userController.login);
// router.get('/profile', authentication, authorization, userController.profile);
// router.get('/users/:id', authentication, authorization, userController.findById);
router.post('/register-with-slack', userController.registerWithSlack);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/user-list', userController.userList);
router.post('/change-password', authorization, userController.changePassword);

module.exports = router;
