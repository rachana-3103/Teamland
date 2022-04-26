'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('individual_game', {
    id: {
      allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4(),
    },
    user_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    question: {
      type: Sequelize.JSON,
      defaultValue: []
    },
    choice: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },
    start_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    end_at: {
      type: Sequelize.DATE,
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
    queryInterface.dropTable('individual_game');
  }
};