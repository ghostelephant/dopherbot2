const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const updatenickname = async ({msg, args, guildInfo}) => {
  const mongoClient = new MongoClient(...dbConnect);

  let newNickname = args.join(" ").trim();

  if(!newNickname.length){
    return invalidate(msg, "Please enter at least one non-space character.");
  }
  try{
    const existingNicknames = Object.values(guildInfo.utils.playerNicknames).map(nick => nick.trim().toLowerCase());
    if(existingNicknames.includes(newNickname.toLowerCase())){
      return invalidate(msg, "That nickname has been taken.");
    }
  }
  catch(e){
    console.log(e);
  }
  
  if(newNickname.length > 12){
    newNickname = newNickname.substring(0, 12);
    msg.reply(`Nicknames cannot be longer than 12 characters.  This will be shortened to "${newNickname}".`)
      .catch(e => console.log(e));
  }
  newNickname += " ".repeat(12 - newNickname.length);

  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    reaction = "🆗";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    const playerKey = `utils.playerNicknames.${msg.author.id}`;

    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {[playerKey]: newNickname}}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in updatenickname.js:\n${e}`);
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in updatenickname.js:\n${e}`);
  }
  finally {
    await msg.react(reaction);
    await mongoClient.close();
  }
}

const description = "Change your display name (max 12 characters)";

module.exports = {
  func: updatenickname,
  description
};
