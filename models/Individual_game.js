
module.exports = (sequelize, DataTypes) => {
  const individual_game = sequelize.define('individual_game',
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
          key: 'id'
        }
      },
      question: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      choice: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      start_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    individual_game.associate = () => {
    // associations can be defined here
  };

  return individual_game;
};
