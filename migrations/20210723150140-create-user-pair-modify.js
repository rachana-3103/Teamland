
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'userpairs',
      'user_login',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    ),
      queryInterface.addColumn(
        'userpairs',
        'user_pair',
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      ),
      queryInterface.addColumn(
        'games',
        'scheduled_group_id',
        {
          type: Sequelize.STRING
        },
      ),
      queryInterface.removeColumn(
        'userpairs',
        'group_id',
        {
          type: Sequelize.STRING
        },
      )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('userpairs', 'user_login');
    queryInterface.removeColumn('userpairs', 'user_pair');
    queryInterface.removeColumn('games', 'scheduled_group_id');
    queryInterface.removeColumn('userpairs', 'group_id');
  }
};
