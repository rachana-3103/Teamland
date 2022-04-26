'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('games', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    start_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    end_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    channel_id:{
      type: Sequelize.STRING,
    },
    scheduled_web_game_id: {
      type: Sequelize.STRING,
    },
    scheduled_reminder_id: {
      type: Sequelize.STRING,
    },
    scheduled_signup_id: {
      type: Sequelize.STRING,
    },
    scheduled_vote_id: {
      type: Sequelize.STRING,
    },
    scheduled_message_id: {
      type: Sequelize.STRING,
    },
    question_meta_id: {
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
    queryInterface.dropTable('games');
  }
};