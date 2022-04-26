module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('channels', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4(),
    },
    channel: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    teams: {
      type: Sequelize.JSON,
      defaultValue: []
    },
    channel_id:{
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable('channels');
  }
};