'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('reminders', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    common_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    scheduled_message_id: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    game_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    slack_id: {
      type: Sequelize.STRING,
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
    queryInterface.dropTable('reminders');
  }
};

