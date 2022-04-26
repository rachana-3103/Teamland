module.exports = (sequelize, DataTypes) => {
  const vote_metadata = sequelize.define('vote_metadata',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      channel_id: {
        type: DataTypes.UUID,
      },
      game_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        references: {
          model: 'games',
          key: 'id',
        },
      },
      question_master_id: {
        type: DataTypes.UUID,
      },
      slack_id: {
        type: DataTypes.STRING,
      },
    });

  vote_metadata.associate = (models) => {
    // associations can be defined here
    vote_metadata.belongsTo(models.users, {
      foreignKey: 'user_id',
      targetKey: 'id',
    });
  };

  return vote_metadata;
};
