const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const nameServer = async ({msg, args, guildInfo}) => {
  let superusers;
  try{
    superusers = guildInfo.utils.superusers;
  }
  catch (e){
    console.error(`Problem in setprefix.js:\n${e}`);
    return msg.react("❌");
  }
  
  if(!superusers.includes(msg.author.id)){
    return invalidate(msg, "You do not have permission to do this.");
  }
  
  const name = args.join(" ");
  if(!name.length){
    return invalidate(msg, "Please specify a name.");
  }
  
  const mongoClient = new MongoClient(...dbConnect);
  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    reaction = "✅";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    
    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {_serverName: name}}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in nameserver.js:\n${e}`);
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in nameserver.js:\n${e}`);
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Gives the server a name in the database.  This is not necessary and does not affect gameplay in any way.";

module.exports = {
  func: nameServer,
  description,
  su: true
};