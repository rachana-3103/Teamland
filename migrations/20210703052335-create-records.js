'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('records', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    channel_id: {
      type: Sequelize.STRING,
    },
    slack_id: {
      type: Sequelize.STRING,
    },
    invite_user_token: {
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
    queryInterface.dropTable('records');
  }
};

