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