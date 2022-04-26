module.exports = (sequelize, DataTypes) => {
  const reminders = sequelize.define('reminders',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
      },
      common_id: {
        type: DataTypes.STRING,
      },
      scheduled_message_id: {
        type: DataTypes.STRING,
      },
      game_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        references: {
          model: 'games',
          key: 'id',
        },
      },
      slack_id: {
        type: DataTypes.STRING,
      },
    });

  reminders.associate = () => {
    // associations can be defined here
  };

  return reminders;
};
