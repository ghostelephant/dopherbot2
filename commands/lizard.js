const {lizardFacts} = require("../utils");

const lizard = ({msg, client}) => {
  const channel = client.channels.cache.get(msg.channelId);
  const fact = lizardFacts[Math.floor(Math.random() * lizardFacts.length)];
  channel.send(fact)
    .then(post => {
      post.react("🦎");
      return post;
    }).catch(e => console.error(`Problem in lizard.js:\n${e}`));
};

const description = "Gives a lizard fact, then reacts with a lizard.";

module.exports = {
  func: lizard,
  description
};