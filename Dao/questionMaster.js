const { question_masters } = require('../models/index');
async function createQuestionMaster(data) {
  return await question_masters.create(data);
}

async function findQuestionMasterById(id) {
  return await question_masters.findOne({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
    where: {
      id
    },
  });
}

async function questionCategorylevel(id) {
  return await question_masters.findOne({
    attributes: ['category', 'level'],
    where: {
      question_id: id
    },
  });
}

async function checkQuestionMasterWithOption(id, questionOption) {
  // console.log(`you are in Dao of checkQuestionMasterWithOption ${id} -->> ${questionOption}`);
  const result = await question_masters.findOne({
    where: {
      question_id: id,
      option: questionOption,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
  return result;
}

async function checkLevelAndCategoryByQuestionId(id) {
  // console.log(`!-- ID !-- ${id}`);
  const checkQuestionIdExists = await question_masters.findOne({
    where: {
      question_id: id,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
  return checkQuestionIdExists;
}

async function questionMasterFindById(id) {
  const questionDeatils = await question_masters.findAll({
    attributes: ['id', 'image_url', 'question_id', 'option'],
    where: {
      question_id: id,
    }
  });
  return questionDeatils;
}

async function imageUpdate(id, imageURL) {
  await question_masters.update(
    { image_url: imageURL },
    {
      where: {
        id: id,
      }
    });
}

async function deleteQuestionMaster(id) {
  await question_masters.destroy({
    where: { id },
    force: true
  });
};

async function findDistinctDataByCategory() {
  return question_masters.aggregate('category', 'DISTINCT', {
    plain: false
  });
}

async function findOptionA(id) {
  return await question_masters.findOne({
    where: {
      id
    },
  });
}

async function findOptionB(id) {
  return await question_masters.findOne({
    where: {
      id
    },
  });
}

module.exports = {
  questionMasterFindById,
  questionCategorylevel,
  createQuestionMaster,
  checkQuestionMasterWithOption,
  checkLevelAndCategoryByQuestionId,
  deleteQuestionMaster,
  imageUpdate,
  findQuestionMasterById,
  findDistinctDataByCategory,
  findOptionA,
  findOptionB
}
