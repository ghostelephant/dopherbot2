const checkIfDophers = str => {
  acceptablePhrases = [
    "dophers",
    "mcdophers",
    "sopher",
    "sopher mcdophers",
    "soph",
    "doph"
  ];
  return acceptablePhrases.includes(str.toLowerCase());
};

const bad = e => console.error(`Problem in godophers.js:\n${e}`);

const godophers = ({msg, client, args}) => {
  if(checkIfDophers(args.join(" "))){
    const channel = client.channels.cache.get(msg.channelId);
    try{
      channel.send("<:Logo2:686674358667837517> <:Logo2:686674358667837517> <:Logo2:686674358667837517>")
      .then( post => {
        post.react("<:Logo2:686674358667837517>")
          .catch(bad);
        post.react("<:Hat:686674262316417048>")
          .catch(bad);
      }).catch(bad);
    }
    catch(e){
      bad(e);
    }
  }
  else{
    msg.reply("What??  No, go Dophers! <:Logo2:686674358667837517>")
      .catch(e => console.log(e));
  }
};

const description = "Makes sure you're cheering for the right team";

module.exports = {
  func: godophers,
  description
};