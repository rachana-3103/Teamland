
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
      queryInterface.addColumn(
        'channels',
        'user_group',
        {
          type: Sequelize.STRING
        },
      )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('channels', 'user_group');
  }
};
