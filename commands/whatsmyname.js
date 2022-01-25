const {MongoClient} = require("mongodb");
const {dbConfig: {dbName, dbConnect}} = require("../utils");

const whatsmyname = async ({msg, guildInfo}) => {
  let nickname;
  try{
    nickname = guildInfo.utils.playerNicknames[msg.author.id];
  }
  catch (e){
    console.log(`Established nickname for user in whatsmyname.js.  Error:\n${e}\n${"*".repeat(30)}`);
  }
  const needsToBeSet = !nickname;

  if(needsToBeSet){
    nickname = msg.author.username.substring(0, 12);
    nickname += " ".repeat(12 - nickname.length);
  }
  await msg.reply(`Your display name is:\n\`${nickname.trim()}\``);

  if(needsToBeSet){
    const mongoClient = new MongoClient(...dbConnect);
    try{
      await mongoClient.connect();
      const db = mongoClient.db(dbName);
      const coll = db.collection("gameplay");
      const playerKey = `utils.playerNicknames.${msg.author.id}`;

      await coll.updateOne(
        {guildId: msg.guildId},
        {$set: {[playerKey]: nickname}}
      ).catch(e => {
        setReaction("❌");
        console.error(`Problem in whatsmyname.js:\n${e}`);
      });
    }
    catch(e){
      console.error(`Problem in whatsmyname.js:\n${e}`);
    }
    finally{
      await mongoClient.close();
    }
  }
};

const description = "Shows your current display name";

module.exports = {
  func: whatsmyname,
  description
};