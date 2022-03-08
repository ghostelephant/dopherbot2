const showguesses = ({msg, client, guildInfo}) => {
  const channel = client.channels.cache.get(msg.channelId);

  const guesses = guildInfo.currentRound;
  if(!guesses){
    return msg.reply("No guesses are in yet.")
      .catch(e => console.log(e));
  }

  const guessesSorted = Object.keys(guesses)
    .filter(key => key !== "pitch")
    .map(playerId => {
      return {
        playerName: guildInfo.utils.playerNicknames[playerId],
        val: guesses[playerId].guess
      }
    })
    .sort((a, b) => a.val - b.val);
  
  let numGuesses = 0;
  let output = "Current guesses:\n```";

  for(let guess of guessesSorted){
    numGuesses++;
    output += `${guess.playerName} |  ${guess.val}\n`
  }

  channel.send(output + 
    (numGuesses ? "```" : "No guesses yet.```")
  )
    .catch(e => console.log(e));
}

const description = "Shows the guesses that have been submitted for this pitch";

module.exports = {
  func: showguesses,
  description
};
