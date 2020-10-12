const translate = require("google-translate-open-api").default;
const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();
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

    default:
      break;
  }

  const language = lngDetector.detect(message, 1);
  if (language[0] && language[0][0] === "finnish") {
    const result = await translate(message, {
      tld: "pl",
      to: "pl",
    });
    const data = result.data[0];
    bot.sendMessage(chatId, data);
  }
  if (language[0] && language[0][0] === "polish") {
    const result = await translate(message, {
      tld: "fi",
      to: "fi",
    });
    const data = result.data[0];
    bot.sendMessage(chatId, data);
  }

  saveToDb(
    {
      chatId,
      username: msg.chat.username,
      message,
      language: language.length >= 1 ? language[0][0] : undefined,
      accuracy:
        language.length >= 1
          ? language[0][1].toString().substr(0, 5)
          : undefined,
    },
    "translations"
  );
};

module.exports = {
  onMessage,
};
