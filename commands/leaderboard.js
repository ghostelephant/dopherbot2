const {rightAlign} = require("../utils");

const generateAvgDiff = ({diffSum, guesses}) => {
  let avg = diffSum / guesses;
  avg = Math.floor(10 * avg) / 10;
  if(avg === Math.floor(avg)){
    avg += ".0";
  }
  return "" + avg;
}

const getSessionScores = session => {
  scores = {};
  for(let round of session){
    for(let playerId in round){
      if(playerId === "pitch") continue;
      if(!(playerId in scores)){
        scores[playerId] = {
          points: 0,
          guesses: 0,
          diffSum: 0
        };
      }
      scores[playerId].points += round[playerId].score;
      scores[playerId].guesses++;
      scores[playerId].diffSum += round[playerId].diff;
    }
  }
  return scores;
};

const generateTable = (scores, nicknames, final) => {
  let table = "```\n";
  table += (final ? "FINAL SESSION STANDINGS:\n\n" : "LEADERBOARD:\n\n");
  table += "PLAYER       ║ PTS ║ #Gs ║ AVGDIFF\n";
  table += "═════════════╬═════╬═════╬════════\n";
  for(let playerId of Object.keys(scores)
    .sort((a, b) => scores[a].guesses - scores[b].guesses)
    .sort((a, b) => scores[b].points - scores[a].points)
  ){
    table += nicknames[playerId] + " ║ ";
    table += rightAlign(scores[playerId].points, 3) + " ║ ";
    table += rightAlign(scores[playerId].guesses, 3) + " ║ ";
    table += rightAlign(generateAvgDiff(scores[playerId]), 7) + "\n";
  }
  return table + "```";
};

const leaderboard = async({msg, guildInfo, client}, final = false) => {
  if(guildInfo.currentSession == undefined){
    return console.log("Leaderboard will not work until a session has been started.");
  }
  const scores = getSessionScores(guildInfo.currentSession);
  const channel = client.channels.cache.get(msg.channelId);
  channel.send(
    generateTable(scores, guildInfo.utils.playerNicknames, final)
  );
}

const description = "Shows the standings in the current session";

module.exports = {
  func: leaderboard,
  description
};