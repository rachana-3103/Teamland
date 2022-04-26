module.exports = (sequelize, DataTypes) => {
    const userpairs = sequelize.define('userpairs',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_login_id: {
                type: DataTypes.STRING,
            },
            user_pair_id: {
                type: DataTypes.STRING,
            },
            channel_id: {
                type: DataTypes.UUID,
            },
            game_id: {
                type: DataTypes.UUID,
            },
            user_login: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            user_pair: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        });

    userpairs.associate = () => {
        // associations can be defined here
    };

    return userpairs;
};
