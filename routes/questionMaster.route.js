const express = require('express');
const questionMasterController = require('../controllers/questionMaster/questionMaster.controller');
const router = express.Router();
const upload = require('../config/multer');
const { authorization, singleKeyAuthorization } = require('../config/authorization');
const { questionMasterValidate } = require('../controllers/questionMaster/questionMasterValidator');

router.post('/question-create', singleKeyAuthorization, upload.any(), questionMasterValidate, questionMasterController.create);
router.get('/question-list', singleKeyAuthorization, questionMasterController.questionList);
router.put('/question-update', authorization, upload.any(), questionMasterController.update);
router.delete('/question-delete' , authorization , questionMasterController.delete);

module.exports = router;
