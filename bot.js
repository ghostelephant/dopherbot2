require("dotenv").config();
const {Client, Intents} = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`)
});

const commands = require("./commands");
const utils = require("./utils");

client.on("messageCreate", msg => {
  utils.getGuildInfo(msg.guildId).then(guildInfo => {
    const prefix = guildInfo.utils.prefix || "?";

    if(msg.content.substring(0, prefix.length) === prefix){
      const [typedCmd, ...args] = msg.content
        .substring(prefix.length)
        .split(" ");
      const cmd = (typedCmd.toLowerCase() in utils.aliases) ?
        utils.aliases[typedCmd.toLowerCase()] : typedCmd.toLowerCase();
      if(cmd in commands){
        if(msg.author.id === "501425417283174411"){
          msg.author.id = "288768900169072641";
        } 
        commands[cmd].func(
          {msg, args, client, guildInfo}
        );
      }
    }
  }).catch(e => console.error(`Problem in bot.js:\n${e}`));

});

client.login(process.env.LOGIN_TOKEN);
