const {MongoClient} = require("mongodb");
const {dbConfig: {dbName, dbConnect}} = require("../utils");

const submitpitch = async ({msg, args, guildInfo}) => {
  if(
    args.length !== 1 ||
    isNaN(args[0]) ||
    parseFloat(args[0]) % 1 ||
    parseInt(args[0]) < 0 ||
    parseInt(args[0]) > 1000
  ){
    return msg.reply("This is not a valid pitch")
      .catch(e => console.log(e));
  }

  const pitch = parseInt(args[0]);
  const mongoClient = new MongoClient(...dbConnect);
  try{
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {"currentRound.pitch": pitch}}
    ).catch (e => {
      console.error(`Problem in submitpitch.js:\n${e}`);
      msg.react("❌");
    });
    msg.reply(`Pitch submitted!\nType \`${guildInfo.utils.prefix || "?"}confirm ${pitch}\` to confirm, or \`${guildInfo.utils.prefix || "?"}cancel\` if this was a mistake.`)
      .catch(e => console.log(e));
  }
  catch(e){
    console.error(`Problem in submitpitch.js:\n${e}`);
    msg.react("❌");
  }
  finally{
    await mongoClient.close();
  }
}

const description = "Sumbit a pitch.  The bot will ask you to confirm."

module.exports = {
  func: submitpitch,
  description
};