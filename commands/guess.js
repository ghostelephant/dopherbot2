const {MongoClient} = require("mongodb");
const {invalidate, dbConfig: {dbName, dbConnect}} = require("../utils");

const guess = async ({msg, args, guildInfo}) => {
  while(args.length && (!args[0] || isNaN(args[0]))){
    args.splice(0, 1);
  }
  if(!args.length){
    return invalidate(msg, "Please enter a number.");
  }
  
  if(args[0] === "1000"){
    msg.reply("*Preeeetty* sure you mean 0")
      .catch(e => console.log(e));
  }  
  
  let guess = parseInt(args[0]) % 1000;
  if(guess < 0) guess += 1000;

  let nickname;
  try{
    nickname = guildInfo.utils.playerNicknames[msg.author.id];
  }
  catch(e){
    console.log(`Nickname not found for user in guess.js.  Error:\n${e}\n${"*".repeat(30)}`);
  }
  if(!nickname){
    nickname = msg.author.username.substring(0, 12);
    nickname += " ".repeat(12 - nickname.length);
  }

  let reaction;
  const setReaction = emoj => reaction = emoj;
  
  const mongoClient = new MongoClient(...dbConnect);
  try{
    reaction = "☑️";
    await mongoClient.connect();
    const db = mongoClient.db(dbName);
    const coll = db.collection("gameplay");
    const guessKey = `currentRound.${msg.author.id}.guess`;
    const playerKey = `utils.playerNicknames.${msg.author.id}`;
    
    await coll.updateOne(
      {guildId: msg.guildId},
      {$set: {
        [guessKey]: guess,
        [playerKey]: nickname
      }}
    ).catch(e => {
      setReaction("❌");
      console.error(`Problem in guess.js:\n${e}`);
    });
  }
  catch(e){
    reaction = "❌";
    console.error(`Problem in guess.js:\n${e}`);
  }
  finally{
    await msg.react(reaction);
    await mongoClient.close();
  }
};

const description = "Submit a guess for the upcoming pitch";

module.exports = {
  func: guess,
  description
};