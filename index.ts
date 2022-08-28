import TelegramBot from "node-telegram-bot-api";
import { onStart } from "./onStart.js";
import { onMessage } from "./onMessage.js";

const bot = new TelegramBot(process.env.token, { polling: true });

bot.on("message", async (msg) => {
  onMessage(msg, bot);
});

onStart();
