const {rightAlign, getSessionScores} = require("../utils");

const {avgDiffToString} = require("../utils");

const parseArguments = args => {
  const fields = {
    order: "",
    session: null,
    season: null,
    alltime: false,
    help: false,
    last: null
  };

  args.forEach(arg => {
    const [name, value] = arg
      .split("=")
      .map(x => x.toLowerCase());

    if(fields.hasOwnProperty(name)){
      if(["help", "alltime"].includes(name)){
        fields[name] = true;
      }
      else if(name === "order"){
        fields.order += (fields.order.length ?
          `,${value}` : value
        );
      }
      else{
        fields[name] = parseInt(value);
      }
    }
  });
  
  return fields;
};

const getOrderCriteria = orderArgs => {
  const criteriaOptions = [
    "points", "-points",
    "avgdiff", "-avgdiff",
    "guesses", "-guesses"
  ];
  const criteria = [];
  for(let i=orderArgs.length - 1; i>=0; i--){
    const criterion = orderArgs[i].toLowerCase();
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

const generateTable = (scoresArray, guildInfo, fields, final) => {
  const {season, session, alltime} = fields;
  
  let lbText = "";
  if(alltime){
    lbText += "ALL-TIME";
  }
  else if(!season && !session){
    lbText += "CURRENT";
  }
  else if(season && !session){
    lbText += `COMBINED SEASON ${season}`;
  }
  else if(session){
    lbText += `SEASON ${season || guildInfo.utils.firstSeason + guildInfo.allTime.length}, SESSION ${session}`;
  }

  let table = "```\n";
  table += (final ?
    "FINAL SESSION STANDINGS:\n\n"
    :
    `${lbText} LEADERBOARD${fields.last ? ` (last ${fields.last} guesses)`: ""}:\n\n`
  );
  table += "    PLAYER       ║ PTS ║ #Gs ║ AVGDIFF\n";
  table += "═════════════════╬═════╬═════╬════════\n";
  for(let i=0; i<scoresArray.length; i++){
    scoreObj = scoresArray[i];
    table += rightAlign(`${i+1}. `, 4);
    table += guildInfo.utils.playerNicknames[scoreObj.playerId] + " ║ ";
    table += rightAlign(scoreObj.points, 3) + " ║ ";
    table += rightAlign(scoreObj.guesses, 3) + " ║ ";
    table += rightAlign(avgDiffToString(scoreObj.avgdiff), 7) + "\n";
  }
  return table + "```";
};

const generateHelpMessage = prefix => {
  let message = "```\n";
  message += "LEADERBOARD OPTIONS\n";
  message += `(Command: ${prefix}leaderboard or ${prefix}lb)\n\n`;
  message += "alltime\n  - All-time since Season 7, when this bot was first used\n  - Default: false\n\n";
  message += "order=option1,option2\n  - Can be comma-separated, or given as multiple order= options\n  - Options: points, guesses, avgdiff\n  - Add a minus in front of any option to reverse the order\n  - Default: points,avgdiff\n\n";
  message += "season=#\n  - Specify the season (7 or later)\n  - Default: current season\n\n";
  message += "session=#\n  - Any valid session within the selected season\n  - Default: current session";
  message += "```";
  
  return message;
}

const validateSeasonSessionLast = (fields, guildInfo) => {
  const errors = [];
  let seasonIdx = null;
  let sessionIdx = null;
  let lastIdx = null;

  if(fields.season === null && fields.session === null && fields.last === null){
    return {
      errors,
      seasonIdx,
      sessionIdx
    };
  }

  if(fields.season !== null && isNaN(fields.season)){
    errors.push("To specify a season, please use a number.");
    fields.season = null;
  }
  if(fields.session !== null && isNaN(fields.session)){
    errors.push("To specify a session, please use a number.");
    fields.session = null;
  }
  if(errors.length){
    return {
      errors,
      seasonIdx,
      sessionIdx
    };
  }

  if(fields.season !== null){
    if(!guildInfo.utils.firstSeason){
      errors.push("Please ask your database administrator to add firstSeason to the database under utils; this is required in order to calibrate calculations of previous seasons.");
      fields.season = null;
    }
    else if(fields.season < guildInfo.utils.firstSeason){
      errors.push(`Season out of range: this bot's data only goes back to Season ${guildInfo.utils.firstSeason}.`);
      fields.season = null; 
    }
    else if(fields.season - guildInfo.utils.firstSeason > guildInfo.allTime.length){
      errors.push("Season out of range.");
      fields.season = null;
    }
    else{
      seasonIdx = fields.season - guildInfo.utils.firstSeason;
    }
  }

  let seasonToCheck;
  if(fields.season === null || seasonIdx === guildInfo.allTime.length){
    seasonToCheck = guildInfo.currentSeason;
  }
  else if(fields.season !== null && fields.season - guildInfo.utils.firstSeason < guildInfo.allTime.length){
    seasonToCheck = guildInfo.allTime[fields.season - guildInfo.utils.firstSeason];
  }

  if(fields.session !== null){
    if(!seasonToCheck || !Array.isArray(seasonToCheck)){
      errors.push("Something weird happened finding the season you entered.");
      fields.season = null;
      fields.session = null;
    }
    else if(seasonToCheck === guildInfo.currentSeason && fields.session - 1 === seasonToCheck.length){
      errors.push("Hint: you don't need to specify a season or session to show the current session's leaderboard!");
      seasonIdx = null;
      fields.season = null;
      fields.session = null;
    }
    else if(!seasonToCheck[fields.session - 1]){
      errors.push("Session out of range.");
      fields.season = null;
      fields.session = null;
    }
    else{
      sessionIdx = fields.session - 1;
    }
  }

  if(fields.last !== null){
    if(fields.alltime || (fields.session === null && fields.season !== null)){
      errors.push("Last argument cannot be stacked with a season-long or all-time leaderboard.");
      fields.last = null;
    }
    else if(fields.last > guildInfo.currentSession.length){
      errors.push(`There have only been ${guildInfo.currentSession.length} pitches this session; cannot show last ${fields.last}`);
      fields.last = null;
    }
    else{
      lastIdx = guildInfo.currentSession.length - fields.last;
    }
  }

  return {
    errors,
    seasonIdx,
    sessionIdx,
    lastIdx
  };
}

const calculateScores = dataUniverse => {
  let flattenedData = [];

  if(dataUniverse.multi){
    dataUniverse.data.forEach(season => 
      season.forEach(session => {
        while(session.length){
          flattenedData.push(
            session.shift()
          );
        }
      })
    );
  }
  else{
    flattenedData = dataUniverse.data;
  }

  return getSessionScores(flattenedData);
};


const leaderboard = async({msg, guildInfo, client, args}, final = false) => {
  try{
    if(guildInfo.currentSession == undefined){
      return console.log("Leaderboard will not work until a session has been started.");
    }

    const fields = parseArguments(args);
    let message = ""
    if(fields.help){
      message += generateHelpMessage(guildInfo.utils.prefix);
    }
    else{
      const {errors, seasonIdx, sessionIdx, lastIdx} = validateSeasonSessionLast(
        fields, guildInfo
      );
      
      if(errors.length){
        message += errors.join("\n");
        if(seasonIdx === null && sessionIdx === null)
          message += "\nShowing current session's leaderboard.";
        else
          message += "\nIncluding all guesses.";
      }

      const sortingCriteria = getOrderCriteria(fields.order.split(","));

      const dataUniverse = {
        multi: false,
        data: guildInfo.currentSession
      };

      if(fields.alltime){
        dataUniverse.multi = true;
        dataUniverse.data = [
          ...guildInfo.allTime,
          [
            ...guildInfo.currentSeason,
            guildInfo.currentSession
          ]
        ];
      }
      else if(sessionIdx !== null){
        dataUniverse.data = ((seasonIdx === guildInfo.allTime.length || seasonIdx === null) ?
          guildInfo.currentSeason[sessionIdx]
          :
          guildInfo.allTime[seasonIdx][sessionIdx]
        );
      }
      else if(seasonIdx !== null){
        dataUniverse.multi = true;
        dataUniverse.data = [seasonIdx === guildInfo.allTime.length ?
          [
            ...guildInfo.currentSeason,
            guildInfo.currentSession
          ]
          :
          guildInfo.allTime[seasonIdx]
        ];
      }
      if(lastIdx && !dataUniverse.multi){
        dataUniverse.data = dataUniverse.data.slice(lastIdx);
      }
      


      const scores = calculateScores(dataUniverse);

      const sortedScoresArray = sortScores(scores, sortingCriteria);

      message += generateTable(sortedScoresArray, guildInfo, fields, final);
    }

    const channel = client.channels.cache.get(msg.channelId);
    channel.send(message || "Whoops! Something went wrong")
      .catch(e => console.log(e));
  }
  catch(e){
    console.log(e);
    msg.reply("Sorry, this command appears to have broken something")
      .catch(e => console.log(e));
  }
};


const description = "Shows current session standings.  For more info, run the leaderboard command 'lb help'";

module.exports = {
  func: leaderboard,
  description
};
