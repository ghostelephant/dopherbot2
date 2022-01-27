const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const endseason = async ({msg, client, guildInfo}) => {
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

  const currentSeason = guildInfo.currentSeason || [];
  const allTime = guildInfo.allTime || [];
  allTime.push(currentSeason);

  const mongoClient = new MongoClient(...dbConnect);
  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    setReaction("✅");
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");

    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {
        allTime,
        currentSeason: [],
        currentSession: []
      }}
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
    const channel = client.channels.cache.get(msg.channelId);
    channel.send("Good luck next season, Dophers!")
      .catch(e => console.log(e));
  }
};

description = "Ends the SEASON and starts a new one.  DO NOT confuse this with \"endsession\"! :)";

module.exports = {
  func: endseason,
  description,
  su: true
};
