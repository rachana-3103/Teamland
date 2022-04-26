
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
      queryInterface.addColumn(
        'records',
        'bot_user_id',
        {
          type: Sequelize.STRING
        },
      ),
      queryInterface.addColumn(
        'vote_metadata',
        'slack_id',
        {
          type: Sequelize.STRING
        },
      ),
        queryInterface.addColumn(
          'games',
          'active',
          {
            type: Sequelize.BOOLEAN
          },
        )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('bot_user_id', 'records');
    queryInterface.removeColumn('slack_id', 'vote_metadata');
  }
};
