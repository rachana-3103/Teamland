
module.exports = (sequelize, DataTypes) => {
  const records = sequelize.define('records',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      channel_id: {
        type: DataTypes.UUID
      },
      slack_id: {
        type: DataTypes.STRING,
      },
      invite_user_token: {
        type: DataTypes.STRING,
      },
      bot_user_id: {
        type: DataTypes.STRING,
      }
    });

    records.associate = (models) => {
    // associations can be defined here
    records.belongsTo(models.users, {
      foreignKey: 'slack_id',
      targetKey: 'slack_id'
    })
  };

  return records;
};
