const { Translate } = require("@google-cloud/translate").v2;
const { gcloud } = require("./secrets.json");
const translate = new Translate({
  key: gcloud,
});
const { saveToDb, getStats } = require("./helpers.js");

const onMessage = async (msg, bot) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  switch (message) {
    case (message.match(/^!stats/) || {}).input:
      const amount = message.split(" ");
      const stats = getStats(chatId, amount[1]);
      bot.sendMessage(chatId, stats);
      break;
    case (message.match(/^hey hackerman/) || {}).input:
      bot.sendMessage(chatId, "Hey! :)");
    default:
      break;
  }

  let [detection] = await translate.detect(message);

  if (
    detection.language &&
    (detection.language === "fi" || detection.language === "pl")
  ) {
    const [translation] = await translate.translate(
      message,
      detection.language === "fi" ? "pl" : "fi"
    );
    console.log(detection.language, translation);
    bot.sendMessage(chatId, translation);
  }

  saveToDb(
    {
      chatId,
      username: msg.chat.username,
      message,
      language: detection.language ? detection.language : undefined,
    },
    "translations"
  );
};

module.exports = {
  onMessage,
};
