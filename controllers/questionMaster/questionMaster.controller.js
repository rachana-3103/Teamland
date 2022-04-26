const { isEmpty, get } = require('lodash');
const { saveQuestionData, findQuestionIdByQuestion, updateOptionInQuestionMaster, questionMetaDataList, findQuestionId, deleteQuestion } = require('../../Dao/questionMetadata');
const { createQuestionMaster, checkLevelAndCategoryByQuestionId, questionMasterFindById, imageUpdate, deleteQuestionMaster } = require('../../Dao/questionMaster');
const { fileUpload, fileRemove } = require('../../config/s3_utils');
const fs = require('fs');

const questionOptions = {
    main_content: 'main-content',
    optionA: 'optionA',
    optionB: 'optionB',
};

const submission = {
    already_submitted: 'Already Submitted',
    not_submitted: 'Not Submitted',
    submitted: 'Submitted Successfully',
};

exports.create = async (req, res, next) => {
    try {
        const file = req.files;
        const { question, category, level } = req.body;
        const submit = {
            [`${questionOptions.main_content}`]: submission.not_submitted,
            [`${questionOptions.optionA}`]: submission.not_submitted,
            [`${questionOptions.optionB}`]: submission.not_submitted,
        };

        const findQuestionExist = await findQuestionIdByQuestion(question.toLowerCase());
        let questionId;
        if (findQuestionExist && !isEmpty(findQuestionExist)) {
            questionId = findQuestionExist.id;
            if (findQuestionExist && findQuestionExist.main_content) {
                submit[`${questionOptions.main_content}`] = submission.already_submitted;
            }
            if (findQuestionExist && findQuestionExist.option_a) {
                submit[`${questionOptions.optionA}`] = submission.already_submitted;
            }
            if (findQuestionExist && findQuestionExist.option_b) {
                submit[`${questionOptions.optionB}`] = submission.already_submitted;
            }
        } else {
            const createQuestion = await saveQuestionData(question);
            questionId = createQuestion.id;
        }

        // console.log(`!! -- AUTO GENERATED QUESTION ID --!! ${JSON.stringify(questionId)}`);
        const checkLevelAndCategory = await checkLevelAndCategoryByQuestionId(questionId);
        if (checkLevelAndCategory && !isEmpty(checkLevelAndCategory)) {
            const DbLevel = get(checkLevelAndCategory, 'level', '');
            const DbCategory = get(checkLevelAndCategory, 'category', '');
            if (DbLevel !== level || DbCategory !== category) {
                return next({
                    message: `Changes found in Level n category -->Level ${DbLevel} category ${DbCategory}`,
                });
            }
        }

        for (const content of file) {
            
            // console.log(`>>>>>>>>>>>>content>>>>>>>>>>>>>${JSON.stringify(content)}`);
            if (content.fieldname === questionOptions.main_content && submit[`${questionOptions.main_content}`] !== submission.already_submitted) {
                let filePath = await fileUpload(content, questionId);
                const mainContentData = {
                    category,
                    level,
                    question_id: questionId,
                    option: questionOptions.main_content,
                    image_url: filePath,
                };
                const result = await createQuestionMaster(mainContentData);

                if (result && !isEmpty(result.id)) {
                    await updateOptionInQuestionMaster(questionId, 'main_content', result.id);
                    submit[`${questionOptions.main_content}`] = submission.submitted;
                }
            }

            if (content.fieldname === questionOptions.optionA && submit[`${questionOptions.optionA}`] !== submission.already_submitted) {
                const { optionContentA } = req.body;
                if (!optionContentA) {
                    return next({
                        message: 'image found but option A name should always be like optionContentA',
                    });
                }
                let filePath = await fileUpload(content, questionId);
                const optionAData = {
                    category,
                    level,
                    question_id: questionId,
                    option: optionContentA,
                    image_url: filePath,
                };
                const result = await createQuestionMaster(optionAData);
                if (result && !isEmpty(result.id)) {
                    await updateOptionInQuestionMaster(questionId, 'option_a', result.id);
                    submit[`${questionOptions.optionA}`] = submission.submitted;
                }
            }

            if (content.fieldname === questionOptions.optionB && submit[`${questionOptions.optionB}`] !== submission.already_submitted) {
                const { optionContentB } = req.body;
                if (!optionContentB) {
                    return next({
                        message: 'image found but option B name should always be like optionContentB',
                    });
                }
                let filePath = await fileUpload(content, questionId);
                const optionBData = {
                    category,
                    level,
                    question_id: questionId,
                    option: optionContentB,
                    image_url: filePath,
                };
                const result = await createQuestionMaster(optionBData);
                if (result && !isEmpty(result.id)) {
                    await updateOptionInQuestionMaster(questionId, 'option_b', result.id);
                    submit[`${questionOptions.optionB}`] = submission.submitted;
                }
            }

            if (submit[`${content.fieldname}`] === submission.already_submitted) {
                fs.unlinkSync(content.path);
            }
        }
        res.send({
            messgae: 'Connected',
            submit,
        });
    } catch (error) {
        return error;
    }
};

exports.questionList = async (req, res) => {
    try {
        const questionList = await questionMetaDataList();
        res.send({
            messgae: 'Question List',
            questionList,
        });
    } catch (error) {
        return error;
    }
};

exports.update = async (req, res) => {
    try {
        const files = req.files;
        const questionId = req.query.questionId;
        const questionMeataData = await findQuestionId(questionId);
        const questionDeatils = await questionMasterFindById(questionId);

        for (const questionMasterData of questionDeatils) {

            for (const file of files) {
                const fileName = questionMasterData.imageURL.split('/')[5];

                if (questionMeataData.main_content === questionMasterData.id && file.fieldname === questionOptions.main_content) {
                    await fileRemove(fileName, questionId);
                    let filePath = await fileUpload(file, questionId);
                    await imageUpdate(questionMasterData.id, filePath);
                }
                if (questionMeataData.option_a === questionMasterData.id && file.fieldname === questionOptions.optionA) {
                    await fileRemove(fileName, questionId);
                    let filePath = await fileUpload(file, questionId);
                    await imageUpdate(questionMasterData.id, filePath);
                }
                if (questionMeataData.option_b === questionMasterData.id && file.fieldname === questionOptions.optionB) {
                    await fileRemove(fileName, questionId);
                    let filePath = await fileUpload(file, questionId);
                    await imageUpdate(questionMasterData.id, filePath);
                }
            }
        }
        res.send({
            messgae: 'Question Updated Successfully !!',
        });
    } catch (error) {
        console.log(error);
        return error;
    }
}

exports.delete = async (req, res) => {
    try {
        const questionId = req.query.questionId;
        const questionDeatils = await questionMasterFindById(questionId);
        await deleteQuestion(questionId);
        for (const questionMasterData of questionDeatils) {
            const fileName = questionMasterData.imageURL.split('/')[5];
            await fileRemove(fileName, questionId);
            await deleteQuestionMaster(questionMasterData.id);
        }
        res.send({
            messgae: 'Question Deleted Successfully !!',
        });
    } catch (error) {
        console.log(error);
        return error;
    }
}

