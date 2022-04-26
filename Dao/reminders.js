const { reminders } = require('../models/index');


async function createReminderWithType(data) {
  return reminders.create(data);
}

async function findReminderBySlackId(slackId, commonId, gameId, type) {
  return reminders.findOne({
    where: {
      slack_id: slackId,
      common_id: commonId,
      game_id: gameId,
      type
    }
  });
}

module.exports = {
  createReminderWithType,
  findReminderBySlackId,
}
