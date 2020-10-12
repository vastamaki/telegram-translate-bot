const translate = require("google-translate-open-api").default;
const TelegramBot = require("node-telegram-bot-api");
const LanguageDetect = require("languagedetect");
const SQLite = require("better-sqlite3");
const lngDetector = new LanguageDetect();
const { token } = require("./secrets.json");

const bot = new TelegramBot(token, { polling: true });

const sql = new SQLite(`./data.sqlite`);

(async function () {
  sql
    .prepare(
      `CREATE TABLE IF NOT EXISTS translations(chatId STRING, text STRING, detected_language STRING, accuracy STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
    )
    .run();
})();

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;

  if (message.includes("!stats")) {
    const amount = message.split(" ");
    sendStats(chatId, amount[1]);
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
    chatId,
    message,
    language.length >= 1 ? language[0][0] : undefined,
    language.length >= 1 ? language[0][1].toString().substr(0, 5) : undefined
  );
});

const saveToDb = (chatId, text, detected_language, accuracy) => {
  sql
    .prepare(
      `INSERT INTO translations (chatId, text, detected_language, accuracy) VALUES ('${chatId}', '${text}', '${detected_language}', '${accuracy}')`
    )
    .run();
};

const sendStats = (chatId, amount) => {
  let message = "";
  const last_10_rows = sql
    .prepare(
      `SELECT * FROM translations WHERE chatId = ? ORDER BY timestamp DESC LIMIT ?`
    )
    .all(chatId, amount || 5);

  last_10_rows.forEach((row, index) => {
    message += `${index + 1}: ${row.text} ${row.detected_language} ${
      row.accuracy
    }\n\n`;
  });
  const stats = last_10_rows ? message : "No stats yet :(";
  bot.sendMessage(chatId, stats);
};
