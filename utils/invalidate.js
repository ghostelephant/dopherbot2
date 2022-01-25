const invalidate = (msg, reason) => {
  msg.react("🚫");
  if(reason){
    msg.reply(reason);
  }
};

module.exports = invalidate;