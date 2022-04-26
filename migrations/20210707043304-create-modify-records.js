
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn(
      'records',
      'channel_id',
      {
        type: Sequelize.STRING
      },
    ),
      queryInterface.removeColumn(
        'vote_metadata',
        'channel_id',
        {
          type: Sequelize.STRING
        },
      ),
      queryInterface.addColumn(
        'records',
        'channel_id',
        {
          type: Sequelize.UUID
        },
      ),
      queryInterface.addColumn(
        'vote_metadata',
        'channel_id',
        {
          type: Sequelize.UUID
        },
      )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('channel_id', 'records');
    queryInterface.removeColumn('channel_id', 'vote_metadata');
  }
};
