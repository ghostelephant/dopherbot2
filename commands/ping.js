const ping = ({msg, args}) => {
  if(!args.length) msg.reply("Pong!")
  .catch(e => console.log(e));
};

const description = "Responds with \"Pong!\" as long as no additional text is included";

module.exports = {
  func: ping,
  description
}