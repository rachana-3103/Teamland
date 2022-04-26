const express = require('express');

const router = express.Router();
const gameController = require('../controllers/Game/game.controller');
const { authorization } = require('../config/authorization');

router.post('/schedule/question_slack',  gameController.scheduledQuestionForSlackUser);
router.get('/channel/all_games', authorization, gameController.getAllChannelScheduledGames);
router.post('/schedule/game_manually', authorization, gameController.scheduledQuestionManually);
router.post('/schedule/switched_channel', authorization, gameController.changeOnGoingGameFrequency);
router.get('/channel/:userId/get_free_channel', authorization, gameController.getFreeChannel);
router.get('/:userId/next_game', authorization, gameController.getNextGame);

module.exports = router;
