const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const unguess = async ({msg, guildInfo}) => {
  if(!(msg.author.id in guildInfo.currentRound)){
    return invalidate(msg, "You have not submitted a guess.");
  }
  
  let reaction;
  const setReaction = emoj => reaction = emoj;

  const mongoClient = new MongoClient(...dbConnect);
  try{
    reaction = "🆗"
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    await coll.updateOne(
      {guildId: msg.guildId},
      {$unset: {
        [`currentRound.${msg.author.id}`]: ""
      }}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in unguess.js:\n${e}`);
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in unguess.js:\n${e}`);
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Delete a guess";

module.exports = {
  func: unguess,
  description
};