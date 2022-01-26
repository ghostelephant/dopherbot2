const {MessageEmbed} = require("discord.js");

const generateAvgDiff = ({diffSum, guesses}) => {
  let avg = diffSum / guesses;
  avg = Math.floor(10 * avg);
  avg /= 10;
  return "" + avg;
}

const generateEmbed = (scores, nicknames, final) => {
  let players = "";
  let points = "";
  let guesses = "";
  let avgDiffs = "";
  for(let playerId of Object.keys(scores)
    .sort((a, b) => scores[a].guesses - scores[b].guesses)
    .sort((a, b) => scores[b].points - scores[a].points)
  ){
    players += nicknames[playerId] + "\n";
    points += scores[playerId].points + "\n";
    guesses += scores[playerId].guesses + "\n";
    avgDiffs += generateAvgDiff(scores[playerId]) + "\n";
  }

  const lbEmbed = new MessageEmbed()
    .setColor("#ffff00")
    .setImage("https://i.imgur.com/BBpxKCY.png")
    .setTitle(final ? "FINAL SESSION STANDINGS" : "LEADERBOARD")
    .addField("Player", players, true)
    .addField("Points", points, true)
    .addField("Guesses", guesses, true)
    .addField("Avg Diff", avgDiffs, true);

  return lbEmbed;
};

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

const leaderboard = async({msg, guildInfo, client}, final = false) => {
  const scores = getSessionScores(guildInfo.currentSession);
  const channel = client.channels.cache.get(msg.channelId);
  channel.send({embeds: [
    generateEmbed(scores, guildInfo.utils.playerNicknames, final)
  ]})
    .catch(e => console.log(e));
}

const description = "Shows the standings in the current session";

module.exports = {
  func: leaderboard,
  description
};