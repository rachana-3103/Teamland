const express = require('express');

const router = express.Router();
const slackController = require('../controllers/slack/slack.controller');
const { authorization } = require('../config/authorization');

router.get('/channelList', authorization, slackController.slackChannelList);
router.post('/channel_memberList', authorization, slackController.userListByChannelId);
router.post('/channelUserList', authorization, slackController.saveChannelUserList);
router.post('/sync-with-slack', authorization, slackController.syncWithSlack);
router.post('/invite-user', slackController.inviteUser);
router.get('/:userId/distinct-category', authorization, slackController.getAllDistintCategory);

module.exports = router;
