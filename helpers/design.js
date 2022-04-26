const { map, get, isEmpty } = require('lodash');

async function questionCreateBlock({
  text, optionA, optionB, mainContent, name, category, optionAId, optionBId, GameId,
}) {
  const block = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':video_game:* Game of the Week*',
      },
    },
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `Would You Rather: ${category}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${text}* ?`,
      },
    },
    {
      type: 'image',
      image_url: mainContent,
      alt_text: 'inspiration',
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: optionA,
          },
          value: `${optionAId},${GameId}`,
          action_id: 'button-action1',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: optionB,
          },
          value: `${optionBId},${GameId}`,
          action_id: 'button-action2',
        },
      ],
    },
  ];
  return block;
}

function makeMoveBeforeDeadline({ name }) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hi ${name} :wave:`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Just a reminder that there are *12Hours* left before this round of *Would You Rather* ends,',
      },
    }, {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Make your move before the deadline.:eyes:',
      },
    },
  ];
}

function thankYouMessageAfterEveryAction({ QuestionName }) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Thank you for playing:',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${QuestionName}*`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':stopwatch: We Will wait *24hours* for other players to make their move.',
        verbatim: false,
      },
    },
    {
      type: 'section',
      text: {
        type: 'plain_text',
        text: ':shushing_face: Keep an eye on our chat to find out the next steps',
        emoji: true,
      },
    },
  ];
}

function signUpRemainderBlock(token) {
  const block = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Hello :wave:Welcome to *Teamland Play*',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'While we wait for the first game to happen, make sure you have signed up!',
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Sign Up',
            emoji: true,
          },
          value: 'click_me_123',
          url: `https://app.ourteamland.com/sign-up?type=user&token=${token}`,
        },
      ],
    },
    {
      type: "divider",
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Each week I will message you a *Would You Rather* statement to vote on.\nAfter you vote, you will get paired with a teammate and try to guess what they picked. :thinking_face:',
      },
    },
  ];
  return block;
}

async function pairingResult(pairData) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Hello, *${pairData.userLoginName}* and *${pairData.userPairName}*\nThank you for playing Would You Rather yesterday.\n You have been paired up for this round to share your results.\nHere is what you two picked:`,
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${pairData.userLoginName}*\n \n*Would Rather Choose*: ${pairData.loginOption}`,
      },
      accessory: {
        type: 'image',
        image_url: `${pairData.loginURL}`,
        alt_text: 'alt text for image',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${pairData.userPairName}*\n \n*Would Rather Choose*: ${pairData.pairOption}`,
      },
      accessory: {
        type: 'image',
        image_url: `${pairData.pairURL}`,
        alt_text: 'alt text for image',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '\n\n:heart: Thank you for playing!\nWant to explore more games and experiences? Visit <https://app.ourteamland.com/|Teamland> to find out!',
      },
    },
  ];
}

async function pollResult(data) {
  const pollImagaAndResult = []
  let vote = 0;
  map(data, (user) => {
    const userDetail = get(user, 'user', {});
    if (!isEmpty(userDetail)) {
      vote += 1;
      pollImagaAndResult.push({
        type: 'image',
        image_url: userDetail.image,
        alt_text: userDetail.name,
      });
    }
  });
  pollImagaAndResult.push({
    type: 'plain_text',
    emoji: true,
    text: `${vote} votes`,
  });
  return pollImagaAndResult
}

async function lastPollingResult(optionA = [], optionAData = [], optionB = [], optionBData = []) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Hello :wave:\nHere is a recap of *Would You Rather* results from two days ago ',
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Own a ${optionA[0].option}*`,
      },
    },
    {
      type: 'context',
      elements: await pollResult(optionAData),
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Own a ${optionB[0].option}*`,
      },
    },
    {
      type: 'context',
      elements: await pollResult(optionBData),
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':heart: Thank you for playing this round!',
      },
    },
  ];
}

async function gameOfDayInTeamLand() {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Game of the Day',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Would You Rather*',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '\n\n',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'Yesterday you made your move for the game *Would you rather*\nOther player have made their move as well.',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '\n\n',
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Click here to guess your teammates answer!*',
      },
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Teamland Play',
            emoji: true,
          },
          value: 'click_me_123',
          style: 'primary',
          url: 'https://app.ourteamland.com/admin-dashboard/game',
        },
      ],
    },
  ];
}

module.exports = {
  questionCreateBlock,
  makeMoveBeforeDeadline,
  thankYouMessageAfterEveryAction,
  signUpRemainderBlock,
  pairingResult,
  lastPollingResult,
  gameOfDayInTeamLand,
};
