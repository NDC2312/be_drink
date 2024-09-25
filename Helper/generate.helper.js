module.exports.generateString = (length) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //   console.log(characters.length);
  let resultRandom = "";
  for (var i = 0; i < length; i++) {
    resultRandom += characters.charAt(Math.random() * length);
  }
  return resultRandom;
};
