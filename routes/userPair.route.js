const express = require('express');

const router = express.Router();
const userPairController = require('../controllers/userPairing/userPairing.controller');
const { authorization } = require('../config/authorization');

router.post('/user-pair', authorization, userPairController.userPair);
router.post('/guess-option', authorization, userPairController.guessOption);

module.exports = router;
