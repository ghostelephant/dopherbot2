const invalidate = (msg, reason) => {
  msg.react("🚫");
  if(reason){
    msg.reply(reason)
      .catch(e => console.log(e));
  }
};

module.exports = invalidate;