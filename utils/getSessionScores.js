const getSessionScores = session => {
  scores = {};
  for(let round of session){
    for(let playerId in round){
      if(playerId === "pitch") continue;
      if(!(playerId in scores)){
        scores[playerId] = {
          points: 0,
          guesses: 0,
          diffSum: 0
        };
      }
      scores[playerId].points += round[playerId].score;
      scores[playerId].guesses++;
      scores[playerId].diffSum += round[playerId].diff;
    }
  }
  for(let playerId in scores){
    scores[playerId].avgdiff = (scores[playerId].diffSum / scores[playerId].guesses);
  }
  return scores;
};

module.exports = getSessionScores;
