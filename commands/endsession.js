const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const endsession = async ({msg, client, guildInfo}) => {
  let superusers;
  try{
    superusers = guildInfo.utils.superusers;
  }
  catch(e){
    console.error(`Problem in endsession.js:\n${e}`);
    return msg.react("❌");
  }

  if(!superusers.includes(msg.author.id)){
    return invalidate(msg, "You do not have permission to do this.");
  }

  const isScrimmage = guildInfo.utils?.isScrimmage || false;

  const currentSession = guildInfo.currentSession || [];
  const currentSeason = guildInfo.currentSeason || [];
  const scrimmages = guildInfo.scrimmages || [];
  
  if(isScrimmage)
    scrimmages.push(currentSession);
  else
    currentSeason.push(currentSession);

  const mongoClient = new MongoClient(...dbConnect);
  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    setReaction("✅");
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");

    const data = {
      [(isScrimmage ? "scrimmages" : "currentSeason")]: (isScrimmage ? scrimmages : currentSeason),
      currentSession: [],
      "utils.isScrimmage": false
    }

    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: data}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in endsession.js:\n${e}`);
    });
  }
  catch(e){
    console.error(`Problem in confirmpitch.js:\n${e}`);
    setReaction("❌");
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
    require("./leaderboard").func({msg, guildInfo, client, args: []}, true);
  }
};

description = "Ends the current session and starts a new one";

module.exports = {
  func: endsession,
  description,
  su: true
};