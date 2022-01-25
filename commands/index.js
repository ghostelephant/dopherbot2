const {readdirSync} = require("fs");
const jsFileNames = readdirSync(__dirname)
  .filter(name => name.substring(name.length - 3) === ".js")
  .map(name => name.substring(0, name.length - 3))
  .filter(name => name !== "index");

const commands = {};
for(let file of jsFileNames){
  commands[file] = require(`./${file}`);
}

module.exports = commands;