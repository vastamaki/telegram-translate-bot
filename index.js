const translate = require("google-translate-open-api").default;
const TelegramBot = require("node-telegram-bot-api");
const LanguageDetect = require("languagedetect");
const lngDetector = new LanguageDetect();

const token = "YOUR_TOKEN_HERE";

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;

  const language = lngDetector.detect(message, 1);
  if (language[0] && (language[0][0] === "finnish")) {
    const result = await translate(message, {
      tld: "pl",
      to: "pl",
    });
    const data = result.data[0];
    bot.sendMessage(chatId, data);
  }
  if (language[0] && (language[0][0] === "polish")) {
    const result = await translate(message, {
      tld: "fi",
      to: "fi",
    });
    const data = result.data[0];
    bot.sendMessage(chatId, data);
  }
});
