const {rightAlign, getSessionScores} = require("../utils");

const avgDiffToString = avgdiff => {
  avgdiff = Math.floor(10 * avgdiff);
  avgdiff /= 10;
  if(avgdiff === Math.floor(avgdiff)){
    avgdiff += ".0";
  }
  return "" + avgdiff;
};

const filterCriteria = args => {
  const criteriaOptions = [
    "points", "-points",
    "avgdiff", "-avgdiff",
    "guesses", "-guesses"
  ];
  const criteria = [];
  for(let i=args.length - 1; i>=0; i--){
    const criterion = args[i].toLowerCase();
    if(!criteriaOptions.includes(criterion)){
      continue;
    }
    criteria.push(criterion);
  }
  return criteria.length ? criteria : ["avgdiff", "points"];
};

const sortScores = (scores, criteria) => {
  try {
    const scoresArray = Object.keys(scores).map(playerId => {
      return {playerId, ...scores[playerId]};
    });
    const defaultDescending = {
      points: true,
      guesses: true,
      avgdiff: false
    }
    for(let criterion of criteria){
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

const generateTable = (scoresArray, nicknames, final) => {
  let table = "```\n";
  table += (final ? "FINAL SESSION STANDINGS:\n\n" : "LEADERBOARD:\n\n");
  table += "PLAYER           ║ PTS ║ #Gs ║ AVGDIFF\n";
  table += "═════════════════╬═════╬═════╬════════\n";
  for(let i=0; i<scoresArray.length; i++){
    scoreObj = scoresArray[i];
    table += rightAlign(`${i+1}. `, 4);
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
    const criteria = filterCriteria(args);
    const sortedScoresArray = sortScores(scores, criteria);
    const table = generateTable(sortedScoresArray, guildInfo.utils.playerNicknames, final);
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