'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('Users');
    queryInterface.dropTable('Vote_MetaData');
    queryInterface.dropTable('Channels');
    queryInterface.dropTable('Games');
    queryInterface.dropTable('Individual_Game');
    queryInterface.dropTable('Question_Master');
    queryInterface.dropTable('Records');
    queryInterface.dropTable('slackBots');
    queryInterface.dropTable('question_metadata');
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('Users');
    queryInterface.dropTable('Vote_MetaData');
    queryInterface.dropTable('Channels');
    queryInterface.dropTable('Games');
    queryInterface.dropTable('Individual_Game');
    queryInterface.dropTable('Question_Master');
    queryInterface.dropTable('Records');
    queryInterface.dropTable('slackBots');
    queryInterface.dropTable('question_metadata');
  }
};