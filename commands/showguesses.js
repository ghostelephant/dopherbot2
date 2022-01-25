const showguesses = ({msg, client, guildInfo}) => {
  const channel = client.channels.cache.get(msg.channelId);

  const guesses = guildInfo.currentRound;
  if(!guesses){
    return msg.reply("No guesses are in yet.");
  }
  
  let numGuesses = 0;
  let output = "Current guesses:\n```";
  for(let playerId in guesses){
    if(playerId === "pitch") continue;
    numGuesses++;
    playerName = guildInfo.utils.playerNicknames[playerId];
    guess = guesses[playerId].guess;
    output += `${playerName} |  ${guess}\n`;
  }
  channel.send(output + 
    (numGuesses ? "```" : "No guesses yet.```")
  );
}

const description = "Shows the guesses that have been submitted for this pitch";

module.exports = {
  func: showguesses,
  description
};