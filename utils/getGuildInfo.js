const {MongoClient} = require("mongodb");
const {dbName, dbConnect} = require("./dbConfig");

const getGuildInfo = async guildId => {
  const mongoClient = new MongoClient(...dbConnect);

  let guildInfo;
  const defaultUtils = {
    prefix: "?",
    superusers: [],
  };

  try{
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    const list = await coll.find({guildId}).toArray();

    if(list.length){
      guildInfo = list[0];
      if(!guildInfo.utils || !guildInfo.utils.prefix){
        guildInfo.utils = defaultUtils;
        await coll.updateOne(
          {guildId},
          {$set: {utils: guildUtils}}
        ).catch(e => console.error(`Problem in getGuildInfo.js:\n${e}`));
      }
    }
    else{
      guildInfo = {
        guildId,
        utils: defaultUtils
      };
      await coll.insertOne(guildInfo)
        .catch(e => console.error(`Problem in getGuildInfo.js:\n${e}`));
    }
  }
  catch (e) {
    console.error(`Problem in getGuildInfo.js:\n${e}`);
  }
  finally{
    await mongoClient.close();
  }
  return guildInfo;
};

module.exports = getGuildInfo;