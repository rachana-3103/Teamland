
module.exports = (sequelize, DataTypes) => {
  const slackbots = sequelize.define('slackbots',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bot_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bot_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bot_user_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      signing_secret: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      app_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });

  slackbots.associate = () => {
    // associations can be defined here
  };

  return slackbots;
};
