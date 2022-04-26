'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'vote_metadata',
      'question_master_id',
      {
        type: Sequelize.UUID
      },
    )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('question_master_id', 'vote_metadata');
  }
};
