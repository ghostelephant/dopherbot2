const {readdirSync} = require("fs");
const jsFileNames = readdirSync(__dirname)
  .filter(name => name.substring(name.length - 3) === ".js")
  .map(name => name.substring(0, name.length - 3))
  .filter(name => name !== "index");

const utils = {};
for(let file of jsFileNames){
  utils[file] = require(`./${file}`);
}

module.exports = utils;