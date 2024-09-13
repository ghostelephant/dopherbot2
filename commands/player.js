const {rightAlign, avgDiffToString} = require("../utils");

const getPlayerSessionData = (session, playerId) => {
  let guesses = 0;
  let score = 0;
  let totalDiff = 0;
  session.forEach(round => {
    if(round[playerId]){
      guesses++;
      score += round[playerId].score;
      totalDiff += round[playerId].diff;
    }
  });

  return guesses ?
    `${rightAlign(score, 3)}  ║  ${rightAlign(guesses, 3)}  ║  ${rightAlign(avgDiffToString(totalDiff / guesses))}`
    :
    null;
};

const player = ({msg, args, guildInfo, client}) => {
  const playerId = args[0] && args[0].substring(0, 2) === "<@" && args[0].substring(args[0].length - 1) === ">" ?
    args[0].substring(2, args[0].length - 1)
    :
    msg.author.id;
  const channel = client.channels.cache.get(msg.channelId);

  const allGuesses = [
    ...guildInfo.allTime,
    [
      ...guildInfo.currentSeason,
      guildInfo.currentSession
    ]
  ]
    .map(season =>
      season.map(session =>
        getPlayerSessionData(session, playerId)
      )
    );

  allGuesses.forEach((season, idx) => {
    const sessionsWithGuesses = season.filter(x => x);
    if(!sessionsWithGuesses.length) return;

    let post = "```";
    post += `\nSEASON ${idx + guildInfo.utils.firstSeason}\nSessn  ║  PTS  ║  #Gs  ║  Avg diff\n═══════╬═══════╬═══════╬══════════`;

    season.forEach((sessionLine, idx) => {
      if(sessionLine)
        post += `\n ${rightAlign(idx+1, 4)}  ║  ${sessionLine}`
    });
    post += "\n```";
    channel.send(post);
  })
}

const description = "Shows player-specific info for past sessions";

module.exports = {
  func: player,
  description
};


// ARGS

// [ '<@501425417283174411>' ]



// GUILD INFO

// {
//   _id: new ObjectId("61f1872fc462e156f9f868fc"),
//   guildId: '450000293913034762',
//   utils: {
//     prefix: '?',
//     superusers: [
//       '288768900169072641',
//       '293940505614483456',
//       '225468192443727873',
//       '358438389160345600',
//       '377826278004490240'
//     ],
//     playerNicknames: {
//       '209183193436258304': 'shaggy      ',
//       '473845222514884610': 'Plack Attack',
//       '288768900169072641': 'ghost       ',
//       '398235187634503702': 'spike       ',
//     }
//   },
//   currentRound: {},
//   _serverName: 'Dophers',
//   currentSession: [
//     {
//       '358438389160345600': [Object],
//       '874281806675992576': [Object],
//       '288768900169072641': [Object],
//       '377826278004490240': [Object],
//       '170236047169552384': [Object],
//       '209183193436258304': [Object],
//       pitch: 453
//     },
//     {
//       '874281806675992576': [Object],
//       '288768900169072641': [Object],
//       '377826278004490240': [Object],
//       '225468192443727873': [Object],
//       '358438389160345600': [Object],
//       pitch: 833
//     }
//   ],
//   currentSeason: [
//     [
//       ...
//     ]
//   ],
//   allTime: [
//     ...
//   ],
//   firstSeason: 7
// }


// MESSAGE

{/* <ref *1> Message {
  channelId: '1016938922145747005',
  guildId: '496735108565303326',
  deleted: false,
  id: '1284225383255769281',
  type: 'DEFAULT',
  system: false,
  content: '?player <@501425417283174411>',
  author: User {
    id: '288768900169072641',
    bot: false,
    system: false,
    flags: UserFlags { bitfield: 0 },
    username: 'ghostelephant',
    discriminator: '0',
    avatar: 'fc64d2fe6a1802f902db241639867343'
  },
  pinned: false,
  tts: false,
  nonce: '1284225382811172864',
  embeds: [],
  components: [],
  attachments: Collection(0) [Map] {},
  stickers: Collection(0) [Map] {},
  createdTimestamp: 1726253591122,
  editedTimestamp: null,
  reactions: ReactionManager { message: [Circular *1] },
  mentions: MessageMentions {
    everyone: false,
    users: Collection(1) [Map] { '501425417283174411' => [User] },
    roles: Collection(0) [Map] {},
    _members: null,
    _channels: null,
    crosspostedChannels: Collection(0) [Map] {},
    repliedUser: null
  },
  webhookId: null,
  groupActivityApplication: null,
  applicationId: null,
  activity: null,
  flags: MessageFlags { bitfield: 0 },
  reference: null,
  interaction: null
} */}