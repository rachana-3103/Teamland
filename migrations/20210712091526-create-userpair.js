module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('userpairs',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4(),
      },
      user_login_id: {
        type: Sequelize.STRING
      },
      user_pair_id: {
        type: Sequelize.STRING,
      },
      channel_id: {
        type: Sequelize.UUID,
      },
      group_id: {
        type: Sequelize.STRING,
      },
      game_id: {
        type: Sequelize.UUID,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    }),
  down: (queryInterface) => {
    queryInterface.dropTable('userpairs');
  }
};
