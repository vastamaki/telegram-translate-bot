import * as dotenv from "dotenv";
dotenv.config({ path: "./stack.env" });

import knex from "knex";
import { v2 } from "@google-cloud/translate";
import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });

const translate = new v2.Translate({
  key: process.env.GCLOUD_KEY,
});

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT as unknown as number,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DB,
  },
  pool: {
    min: 1,
    max: 1,
  },
});

process.on("uncaughtException", async () => {
  console.error("error");
});

bot.on("message", async (msg: TelegramBot.Message) => {
  onMessage(msg, bot);
});

const getStats = async (chatId: number, amount: number) => {
  let message = "";
  const last_10_rows = await db("translations")
    .select("*")
    .where("chatId", "=", chatId)
    .orderBy("timestamp", "desc")
    .limit(amount || 5);

  last_10_rows.forEach((row, index) => {
    message += `${index + 1}. ${row.message}
    Language: ${row.language}
    Accuracy: ${parseFloat(row.accuracy).toFixed(3)}\n`;
  });
  return last_10_rows ? message : "No stats yet :(";
};

const onMessage = async (msg: TelegramBot.Message, bot: TelegramBot) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const message = msg.text;

  if (!message) return;

  const optedOut = await db("optouts")
    .select("*")
    .where("userId", "=", userId)
    .first();

  if (optedOut) return;

  switch (message) {
    case (message.match(/^!optout/) || {}).input:
      try {
        await db("optouts").insert({
          userId,
          reason: message.replace("!optout", ""),
        });
        await bot.sendMessage(
          chatId,
          "Hey, the spyware is now permanently disabled from your account!"
        );
      } catch {
        console.error("Failed to optout");
      }
      break;
    case (message.match(/^!stats/) || {}).input:
      const amount = message.split(" ");
      const stats = await getStats(chatId, parseInt(amount[1]));
      await bot.sendMessage(chatId, stats);
      break;
    case (message.match(/^hey hackerman/) || {}).input:
      await bot.sendMessage(chatId, "Hi");
      break;
    default:
      break;
  }

  let [detection] = await translate.detect(message);

  if (["fi", "pl"].includes(detection.language)) {
    try {
      const [translation] = await translate.translate(
        message,
        detection.language === "fi" ? "pl" : "fi"
      );
      await bot.sendMessage(chatId, translation);
    } catch {
      console.error("Failed to translate/send message");
    }
  }

  await db("translations").insert({
    chatId,
    username: msg.chat.username || msg.from.username,
    message,
    accuracy: detection.confidence,
    language: detection.language ? detection.language : undefined,
  });
};
