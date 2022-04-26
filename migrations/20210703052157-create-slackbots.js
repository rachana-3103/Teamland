module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('slackbots',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4(),
      },
      bot_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bot_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bot_user_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      signing_secret: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      app_token: {
        type: Sequelize.STRING,
        allowNull: false,
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
  down: (queryInterface) => queryInterface.dropTable('slackbots'),
};
