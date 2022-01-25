const rightAlign = (num, width) => {
  let str = num.toString();
  return " ".repeat(width - str.length) + str;
};

module.exports = rightAlign;