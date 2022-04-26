module.exports = (sequelize, DataTypes) => {
  const question_metadata = sequelize.define('question_metadata',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      main_content: {
        type: DataTypes.UUID,
        references: {
          model: 'question_masters',
          key: 'id',
        },
      },
      option_a: {
        type: DataTypes.UUID,
        references: {
          model: 'question_masters',
          key: 'id',
        },
      },
      option_b: {
        type: DataTypes.UUID,
        references: {
          model: 'question_masters',
          key: 'id',
        },
      },
    });

    question_metadata.associate = (models) => {
    // associations can be defined here
    question_metadata.hasMany(models["question_masters"], {
      foreignKey: "question_id",
      targetKey: "id"
    })
  };

  return question_metadata;
};
