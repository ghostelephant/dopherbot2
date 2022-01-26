const {MessageEmbed} = require("discord.js");

const embed = ({msg, client}) => {
  const channel = client.channels.cache.get(msg.channelId);

  const testEmbed = new MessageEmbed()
    .setColor("#ffdead")
    .addField("title", "text here");

  channel.send({embeds: [testEmbed]})
    .catch(e => console.log(e));
};

const description = "tests an embed";

module.exports = {
  func: embed,
  description
};