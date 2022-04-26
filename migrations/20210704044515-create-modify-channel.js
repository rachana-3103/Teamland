'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'channels',
      'category',
      {
        type: Sequelize.JSON
      },
    )
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('category', 'channels');
  }
};