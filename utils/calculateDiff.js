const calculateDiff = (pitch, guess) =>  {
  let output = (pitch - guess + 499) % 1000;
  if (output < 0)
    output += 1000;
  return Math.abs(output - 499);
};

module.exports = calculateDiff;