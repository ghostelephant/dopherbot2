const {rightAlign} = require("../utils");

const avgDiffToString = avgdiff => {
  avgdiff = Math.floor(10 * avgdiff);
  if(avgdiff === Math.floor(avgdiff)){
    avgdiff += ".0";
  }
  return "" + avgdiff;
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
  for(let playerId in scores){
    scores[playerId].avgdiff = (scores[playerId].points / scores[playerId].guesses);
  }
  return scores;
};

const reverseArray = arr => {
  for(let i=0; i<arr.length / 2; i++){
    [arr[i], arr[arr.length - i - 1]] = [arr[arr.length - i - 1], arr[i]];
  }
  return arr;
}

const sortScores = (scores, criteria) => {
  try {
    criteria = reverseArray(criteria);
    const scoresArray = Object.keys(scores).map(playerId => {
      return {playerId, ...scores[playerId]};
    });
    const criteriaOptions = [
      "points", "-points",
      "avgdiff", "-avgdiff",
      "guesses", "-guesses"
    ];
    const defaultDescending = {
      points: true,
      guesses: true,
      avgdiff: false
    }
    for(let criterion of criteria){
      criterion = criterion.toLowerCase();
      if(!criteriaOptions.includes(criterion)){
        continue;
      }
      let reverse = false;
      if(criterion[0] === "-"){
        reverse = true;
        criterion = criterion.substring(1);
      }
      const descending = reverse ? 
        !defaultDescending[criterion]
        :
        defaultDescending[criterion];

      scoresArray.sort((a, b) => 
        descending ?
          scores[b.playerId][criterion] - scores[a.playerId][criterion]
          :
          scores[a.playerId][criterion] - scores[b.playerId][criterion]
      );
    }
    return scoresArray;
  }
  catch(e){
    console.log(e);
    return [];
  }
};

const generateTable2 = (scoresArray, nicknames, final) => {
  let table = "```\n";
  table += (final ? "FINAL SESSION STANDINGS:\n\n" : "LEADERBOARD:\n\n");
  table += "PLAYER       ║ PTS ║ #Gs ║ AVGDIFF\n";
  table += "═════════════╬═════╬═════╬════════\n";
  for(let scoreObj of scoresArray){
    table += nicknames[scoreObj.playerId] + " ║ ";
    table += rightAlign(scoreObj.points, 3) + " ║ ";
    table += rightAlign(scoreObj.guesses, 3) + " ║ ";
    table += rightAlign(avgDiffToString(scoreObj.avgdiff), 7) + "\n";
  }
  return table + "```";
};

const leaderboard = async({msg, guildInfo, client, args}, final = false) => {
  try{
    if(guildInfo.currentSession == undefined){
      return console.log("Leaderboard will not work until a session has been started.");
    }
    const scores = getSessionScores(guildInfo.currentSession);
    const criteria = args.length ? args : ["points", "avgdiff"];
    const sortedScoresArray = sortScores(scores, criteria);
    const table = generateTable2(sortedScoresArray, guildInfo.utils.playerNicknames, final);
    const channel = client.channels.cache.get(msg.channelId);
    channel.send(table)
      .catch(e => console.log(e));
  }
  catch(e){
    console.log(e);
    msg.reply("Sorry, this command appears to have broken something")
      .catch(e => console.log(e));
  }
}

const description = "Shows current session standings.  Sort options: points, guesses, avgdiff; add - to any option to order in reverse.  Options can be combined.";

module.exports = {
  func: leaderboard,
  description
};