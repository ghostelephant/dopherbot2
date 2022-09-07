const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const unpitch = async ({msg, guildInfo}) => {
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

  let reaction;
  const setReaction = emoj => reaction = emoj;
  const mongoClient = new MongoClient(...dbConnect);
  try{
    const currentSession = guildInfo.currentSession || [];
    if(!currentSession.length){
      return invalidate("This appears to be the first round of the session; cannot unpitch.");
    }

    const lastRound = currentSession.pop();
    delete lastRound.pitch;
    console.log(lastRound);
    for(let key in lastRound){
      delete lastRound[key].score;
      delete lastRound[key].diff;
    }
    
    reaction = "🤦";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {
        currentSession,
        currentRound: lastRound
      }}
    ).catch(e => {
      reaction = "❌";
      console.error(`Problem in unpitch.js:\n${e}`);
    });
  }
  catch(e){
    console.error(`Problem in unpitch.js:\n${e}`);
    setReaction("❌");
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Undo the submission of a pitch (useful in case of error)";

module.exports = {
  func: unpitch,
  description,
  su: true
};