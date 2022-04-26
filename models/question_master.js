module.exports = (sequelize, DataTypes) => {
    const question_masters = sequelize.define('question_masters',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            question_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            option: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            level: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        });

    question_masters.associate = () => {
        // associations can be defined here
    };

    return question_masters;
};
