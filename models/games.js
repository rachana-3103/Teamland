module.exports = (sequelize, DataTypes) => {
    const games = sequelize.define('games',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            start_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_at: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            channel_id: {
                type: DataTypes.STRING,
            },
            scheduled_web_game_id: {
                type: DataTypes.STRING,
            },
            scheduled_reminder_id: {
                type: DataTypes.STRING,
            },
            scheduled_signup_id: {
                type: DataTypes.STRING,
            },
            scheduled_vote_id: {
                type: DataTypes.STRING,
            },
            scheduled_message_id: {
                type: DataTypes.STRING,
            },
            question_meta_id: {
                type: DataTypes.STRING,
            },
            scheduled_group_id: {
                type: DataTypes.STRING,
            },
            active: {
                type: DataTypes.BOOLEAN,
            },
        });

    games.associate = (models) => {
        // associations can be defined here
        games.belongsTo(models.channels, {
            foreignKey: 'channel_id',
            targetKey: 'id'
        })
    };

    return games;
};
