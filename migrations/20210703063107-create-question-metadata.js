'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('question_metadata', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    question: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    main_content: {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'question_masters',
        key: 'id'
      }
    },
    option_a: {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'question_masters',
        key: 'id'
      }
    },
    option_b: {
      type: Sequelize.UUID,
      allowNull: true,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'question_masters',
        key: 'id'
      }
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
    queryInterface.dropTable('question_metadata');
  }
};
