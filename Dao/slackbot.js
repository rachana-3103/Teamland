const { slackbots } = require('../models/index');

async function findTokenByBotId(botId) {
    return slackbots.findOne({
        where: {
            bot_id: botId,
        },
    });
}

module.exports = {
    findTokenByBotId,

};
