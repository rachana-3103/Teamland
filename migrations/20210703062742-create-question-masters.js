'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('question_masters', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    question_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },
    option: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image_url: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    level: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable('question_masters');
  }
};
