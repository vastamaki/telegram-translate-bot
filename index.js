const TelegramBot = require("node-telegram-bot-api");
const { token } = require("./secrets.json");
const { onStart } = require("./onStart.js");
const { onMessage } = require("./onMessage.js");

const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  onMessage(msg, bot);
});

onStart();
