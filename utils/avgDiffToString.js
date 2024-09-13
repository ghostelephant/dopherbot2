const avgDiffToString = avgdiff => {
  avgdiff = Math.floor(10 * avgdiff);
  avgdiff /= 10;
  if(avgdiff === Math.floor(avgdiff)){
    avgdiff += ".0";
  }
  return "" + avgdiff;
};

module.exports = avgDiffToString;