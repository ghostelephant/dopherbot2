const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const addsuperuser = async ({msg, args, guildInfo}) => {
  let superusers;
  try{
    superusers = guildInfo.utils.superusers;
  }
  catch(e){
    console.error(`Problem in addsuperuser.js:\n${e}`)
    return msg.react("❌");
  }

  if(!superusers.includes(msg.author.id)){
    return invalidate(msg, "You do not have permission to do this.");
  }

  let sU = args[0];
  if(!args.length || sU.substring(0, 3) !== "<@!" || sU.substring(sU.length - 1) !== ">"){
    return invalidate(msg, "Please enter a valid user.");
  }

  sU = sU.substring(3, sU.length - 1);
  if(isNaN(sU)){
    return invalidate("Please enter a valid user.");
  }

  const mongoClient = new MongoClient(...dbConnect);
  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    reaction = "🕵️‍♀️";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");

    await coll.updateOne(
      {guildId: msg.guildId},
      {$push: {"utils.superusers": sU}}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in addsuperuser.js:\n${e}`)
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in addsuperuser.js:\n${e}`)
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Type the command and then ping a user to add them to the list of superusers";

module.exports = {
  func: addsuperuser,
  description,
  su: true
};