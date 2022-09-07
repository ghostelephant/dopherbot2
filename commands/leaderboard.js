const {rightAlign, getSessionScores} = require("../utils");

const avgDiffToString = avgdiff => {
  avgdiff = Math.floor(10 * avgdiff);
  avgdiff /= 10;
  if(avgdiff === Math.floor(avgdiff)){
    avgdiff += ".0";
  }
  return "" + avgdiff;
};

const parseArguments = args => {
  const fields = {
    order: [],
    session: null,
    season: null,
    alltime: false,
    help: false,
  };

  args.forEach(arg => {
    const [name, value] = arg.split("=");
    if(fields.hasOwnProperty(name)){
      if(["help", "alltime"].includes(name)){
        fields[name] = true;
      }
      else if(name === "order"){
        fields.order.push(value);
      }
      else{
        try{
          const valueInt = parseInt(value);
          fields[name] = valueInt;
        }
        catch(e){
          fields[name] = "error";
        }
      }
    }
  });
  console.log(fields);
  
  return fields;
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
    if(criteriaOptions.includes(criterion)){
      criteria.push(criterion);
    }
  }
  return criteria.length ? criteria : ["avgdiff", "points"];
};

// const filterCriteria = args => {
//   orderArgs = args
//     .filter(arg => arg.length > 6 && arg.substring(0, 6) === "order=")
//     .map(arg => arg.substring(6))
//     .join(",")
//     .split(",")
//     .filter(x => x);

//   const criteriaOptions = [
//     "points", "-points",
//     "avgdiff", "-avgdiff",
//     "guesses", "-guesses"
//   ];
//   const criteria = [];
//   for(let i=orderArgs.length - 1; i>=0; i--){
//     const criterion = args[i].toLowerCase();
//     if(criteriaOptions.includes(criterion)){
//       criteria.push(criterion);
//     }
//   }
//   return criteria.length ? criteria : ["avgdiff", "points"];
// };


const getOrderCriteria = orderArgs => {
  const criteriaOptions = [
    "points", "-points",
    "avgdiff", "-avgdiff",
    "guesses", "-guesses"
  ];
  const criteria = [];
  for(let i=orderArgs.length - 1; i>=0; i--){
    const criterion = args[i].toLowerCase();
    if(criteriaOptions.includes(criterion)){
      criteria.push(criterion);
    }
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
  table += "    PLAYER       ║ PTS ║ #Gs ║ AVGDIFF\n";
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

const generateHelpMessage = prefix => {
  let message = "```\n";
  message += `The ${prefix}leaderboard or ${prefix}lb command defaults to showing the current session, ordered by points then by average diff.\n`;
  message += "To change the defaults, append any of the following after the command:\n\n";
  message += '"alltime"\n - All-time since Season 7, when this bot was first used';
  message += '"order=option1,option2"\n  - Comma-separated, no spaces\n  - Options: points,guesses,avgdiff\n  - Add a minus to the beginning of an option to reverse it\n\n';
  message += '"season=#"\n  - 7 or 8\n\n';
  message += '"session=#"\n  - Any valid session within the selected season\n  - Defaults to current season';
  
  message += "```";
  
  return message;
}

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






// const leaderboard = async({msg, guildInfo, client, args}, final = false) => {
//   try{
//     if(guildInfo.currentSession == undefined){
//       return console.log("Leaderboard will not work until a session has been started.");
//     }
//     const fields = parseArguments(args);
//     let message = "hi"
//     if(fields.help){
//       message += generateHelpMessage(guildInfo.utils.prefix);
//     }
//     else if(fields.alltime){
//       message += " all time";
//     }
//     else{
//       message += " something else";
//     };

//     const sortingCriteria = filterCriteria(fields.order);


//     // const scores = getSessionScores(guildInfo.currentSession);
//     // const criteria = filterCriteria(args);
//     // const sortedScoresArray = sortScores(scores, criteria);
//     // const table = generateTable(sortedScoresArray, guildInfo.utils.playerNicknames, final);

//     const channel = client.channels.cache.get(msg.channelId);
//     channel.send(message)
//       .catch(e => console.log(e));
//   }
//   catch(e){
//     console.log(e);
//     msg.reply("Sorry, this command appears to have broken something")
//       .catch(e => console.log(e));
//   }
// }


const description = "Shows current session standings.  For more info, run the leaderboard command 'lb help'";

module.exports = {
  func: leaderboard,
  description
};
