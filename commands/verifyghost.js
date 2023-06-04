const verifyghost = ({msg, args}) => {
  msg.reply(
    "I, ghostelephant#6650, hereby verify that I am (with any luck, temporarily) using the account spectralpachyderm#5903"
  )
    .catch(e => console.log(e));
};

const description = "Temporary command to verify I am who I say I am";

module.exports = {
  func: verifyghost,
  description
}
