module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('users',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4(),
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
      },
      access_level: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      register_at: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      slack_id: {
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      bot_user_id: {
        type: Sequelize.STRING,
      },
      reset_token: {
        type: Sequelize.STRING,
      },
      on_board: {
        type: Sequelize.BOOLEAN,
      },
      token: {
        type: Sequelize.STRING,
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
    queryInterface.dropTable('users');
  }
};
