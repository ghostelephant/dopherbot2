const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const scrimmage = async ({msg, args, guildInfo, client}) => {
  let isScrimmage = false;
  if("isScrimmage" in guildInfo.utils){
    isScrimmage = guildInfo.utils.isScrimmage;
  }

  if(args[0]){
    if(args[0].toLowerCase() === "false")
      isScrimmage = false;
    else if(args[0].toLowerCase() === "true")
      isScrimmage = true;
  }
  else
    isScrimmage = !isScrimmage;

  const mongoClient = new MongoClient(...dbConnect);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  const coll = db.collection("gameplay");

  await coll.updateOne(
    {guildId: msg.guildId},
    {$set: {
      "utils.isScrimmage": isScrimmage
    }}
  )
  .then(() => {
    msg.react("*️⃣");
    const channel = client.channels.cache.get(msg.channelId);
    channel.send(isScrimmage ?
      "This game has been marked as a scrimmage."
      :
      "This game has been marked as NOT a scrimmage."
    );
  }).catch(e => {
    msg.react("❌");
    console.error(`Problem in scrimmage.js:\n${e}`);
  });

  
};

const description = "Toggle whether the current session is a scrimmage (or include \"true\" or \"false\" argument to set manually rather than toggling)"

module.exports = {
  func: scrimmage,
  description
};