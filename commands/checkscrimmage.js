const checkscrimmage = ({msg, guildInfo}) => {
  const isScrimmage = !!guildInfo?.utils?.isScrimmage;
  msg.reply(isScrimmage ?
    "YES, this game is marked as a scrimmage"
    :
    "NO, this game is NOT marked as a scrimmage."
  );
};

description = "Check whether the current game is marked as a scrimmage";

module.exports = {
  func: checkscrimmage,
  description
};
