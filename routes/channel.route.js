const express = require('express');
const router = express.Router();

const channelController = require('../controllers/channel/channel.controller');
const { authorization } = require('../config/authorization');

router.post('/users', authorization, channelController.getUsers);
router.get('/:userId/user_group', authorization, channelController.getAllUserGroup);

module.exports = router;
