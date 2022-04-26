const { Op } = require('sequelize');
const { question_metadata, question_masters } = require('../models/index');

async function saveQuestionData(data) {
  console.log(`>>>>>>>>>>saveQuestionData>>>>>>>>>>>>${JSON.stringify(data)}`);
  const saveData = await question_metadata.create({
    question: data.toLowerCase(),
  });
  return saveData;
}

async function findQuestionIdByQuestion(data) {
  const result = await question_metadata.findOne({
    where: {
      question: data,
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  });
  return result;
}

async function updateOptionInQuestionMaster(questionId, column, columnId) {
  return await question_metadata.update({
    [`${column}`]: columnId,
  }, {
    where: {
      id: questionId,
    },
  });
}

async function questionMetaDataList() {
  return question_metadata.findAll(
    {
      include: [{
        model: question_masters,
        attributes: ['option', 'image_url', 'level', 'category'],
      }],
      attributes: ['question'],
    },
  );
}

async function findQuestionId(id) {
  const result = await question_metadata.findOne({
    attributes: ['main_content', 'option_a', 'option_b'],
    where: {
      id,
    },
  });
  return result;
}

async function deleteQuestion(id) {
  await question_metadata.destroy({
    where: { id },
    force: true,
  });
}

async function filterDataByColumn(colName, colData) {
  return question_metadata.findAll({
    include: [
      {
        model: question_masters,
        where: {
          [`${colName}`]: {
            [Op.in]: colData,
          },
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'main_content', 'option_a', 'option_b'],
    },
  });
}

async function findAllQuesMasterByQuestionId(questionId) {
  return question_metadata.findAll({
    include: [
      {
        model: question_masters,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    where: {
      id: questionId
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'main_content', 'option_a', 'option_b'],
    },
  });
}


async function excludeSomeQuestionId(questionId, colName, colData, limit = 1) {
  return question_metadata.findAll({
    include: [
      {
        model: question_masters,
        where: {
          [`${colName}`]: {
            [Op.in]: colData,
          },
        },
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'mainContent', 'optionA', 'optionB'],
    },
    where: {
      id: {
        [Op.notIn]: questionId,
      },
    },
    limit
  });
}

async function findMetaData(id) {
  return await question_metadata.findOne({
    where: {
      id
    }
  })
}

async function findAllQuesMasterByQuestionIds(questionId = []) {
  return question_metadata.findAll({
    include: [
      {
        model: question_masters,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    where: {
      id: {
        [Op.in]: questionId
      }
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'main_content', 'option_a', 'option_b'],
    },
  });
}

module.exports = {
  questionMetaDataList,
  saveQuestionData,
  findQuestionIdByQuestion,
  updateOptionInQuestionMaster,
  findQuestionId,
  deleteQuestion,
  filterDataByColumn,
  findAllQuesMasterByQuestionId,
  excludeSomeQuestionId,
  findMetaData,
  findAllQuesMasterByQuestionIds
};
