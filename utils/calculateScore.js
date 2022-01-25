const calculateScore = diff => {
  if(diff === 0)
    return 15;
  if(diff < 21)
    return 8;
  if(diff < 51)
    return 5;
  if(diff < 101)
    return 3;
  if(diff < 151)
    return 2;
  if(diff < 201)
    return 1;
  if(diff >= 495)
    return -5;
  return 0;
}

module.exports = calculateScore;