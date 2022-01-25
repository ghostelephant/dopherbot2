const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const cancelpitch = async ({msg, guildInfo}) => {
  let reaction;
  const setReaction = emoj => reaction = emoj;

  let pitch;
  try{
    pitch = guildInfo.currentRound.pitch;
  }
  catch{
    pitch = undefined;
  }
  if(pitch === undefined){
    return invalidate(msg, "No pitch was submitted!");
  }
  
  const mongoClient = new MongoClient(...dbConnect);
  try{
    reaction = "🤦‍♀️";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    await coll.updateOne(
      {guildId: msg.guildId},
      {$unset: {"currentRound.pitch": null}}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in cancelpitch.js:\n${e}`);
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in cancelpitch.js:\n${e}`);
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Cancel an erroneously submitted pitch";

module.exports = {
  func: cancelpitch,
  description
};