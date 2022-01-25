const {MongoClient} = require("mongodb");
const {dbName, dbConnect} = require("./dbConfig");

const saveToDatabase = async ({collName, update, identifier, reactions}) => {
  const mongoClient = new MongoClient(...dbConnect);

  let reaction;
  const setReaction = emoj => reaction = emoj;

  try{
    reaction = reactions.success;
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection(collName);

    if(identifier){
      await coll.updateOne(
        identifier,
        update
      ).catch(e => {
        setReaction(reactions.fail);
        console.error(`Problem in saveToDatabase.js:\n${e}`);
      });
    }
    else {
      await coll.insertOne(
        update
      ).catch(e => {
        setReaction(reactions.fail);
        console.error(`Problem in saveToDatabase.js:\n${e}`);
      });
    }
  }
  catch(e){
    console.error(`Problem in saveToDatabase.js:\n${e}`);
    reaction = reactions.fail;
  }
  finally{
    await mongoClient.close();
  }
  return await reaction;
};

module.exports = saveToDatabase;