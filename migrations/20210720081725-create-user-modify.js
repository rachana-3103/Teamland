
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'users',
      'auth_token',
      {
        type: Sequelize.STRING(1234)
      },
    ),
      queryInterface.addColumn(
        'users',
        'token_expired',
        {
          type: Sequelize.DATE
        },
      )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('users', 'auth_token');
    queryInterface.removeColumn('users', 'token_expired');
  }
};
