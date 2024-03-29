const {MessageEmbed} = require("discord.js");
const {aliases} = require("../utils");

const buildEmbed = (prefix, normalCommands, superCommands) => {
  let normalCommandText = "";
  for(let command of normalCommands){
    normalCommandText += `**${prefix}${command.name}:** ${command.description}\n`;
  }
  let superCommandText = "";
  for(let command of superCommands){
    superCommandText += `**${prefix}${command.name}:** ${command.description}\n`;
  }
  let aliasText = "Sometimes commands are long, or conflict with another bot.  Use these aliases to type less, or to be more specific:\n\n";
  for(let alias in aliases){
    aliasText += `Use **${prefix}${alias}** for ${prefix}${aliases[alias]}\n`
  }

  const disambigText = `Use one of the following commands for more specific help info:\n\n**${prefix}help gameplay\n${prefix}help admin\n${prefix}help aliases**`;
  
  const embeds = {
    gameplay: new MessageEmbed()
      .setColor("#ffa500")
      .setTitle("NORMAL COMMANDS")
      .setDescription(normalCommandText),
  
    admin: new MessageEmbed()
      .setColor("#ffa500")
      .setTitle("ADMINISTRATIVE COMMANDS (require elevated privileges)")
      .setDescription(superCommandText),
    
    aliases: new MessageEmbed()
      .setColor("#ffa500") 
      .setTitle("Aliases") 
      .setDescription(aliasText),

    disambig: new MessageEmbed()
      .setColor("#ffa500")
      .setTitle("Help")
      .setDescription(disambigText)
  };

  const rawText = {
    gameplay: normalCommandText,
    admin: superCommandText,
    aliases: aliasText,
    disambig: disambigText
  };

  return {
    embeds,
    rawText
  };
};

const help = ({msg, client, guildInfo, args}) => {
  const commands = require("./index");
  const prefix = guildInfo.utils.prefix;

  const normalCommands = [];
  const superCommands = [];
  for(let command in commands){
    let commandObj = {
      name: command,
      description: commands[command].description
    };
    if(commands[command].su){
      superCommands.push(commandObj);
    } else {
      normalCommands.push(commandObj);
    }
  }

  const {embeds: helpEmbeds} = buildEmbed(prefix, normalCommands, superCommands);

  const embedToPost = ((args.length && args[0].toLowerCase() in helpEmbeds) ?
    helpEmbeds[args[0].toLowerCase()]
    :
    helpEmbeds.disambig
  );
  
  const channel = client.channels.cache.get(msg.channelId);
  channel.send({embeds: [
    embedToPost
  ]})
    .catch(e => console.log(e));
};

const description = "Shows this message";

module.exports = {
  func: help,
  description
};