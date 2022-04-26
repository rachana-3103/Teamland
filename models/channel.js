module.exports = (sequelize, DataTypes) => {
  const channels = sequelize.define('channels',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      channel: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      teams: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      channel_id: {
        type: DataTypes.STRING,
      },
      category: {
        type: DataTypes.JSON,
      },
      user_group: {
        type: DataTypes.STRING,
      },
    });

  channels.associate = (models) => {
    // associations can be defined here
    channels.belongsTo(models.records, {
      foreignKey: 'channel_id',
      targetKey: 'id',
    });
    channels.belongsTo(models.users,{
        foreignKey: 'user_id',
        targetKey: 'id'
    })
  };

  return channels;
};
