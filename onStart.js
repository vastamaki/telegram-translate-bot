const SQLite = require("better-sqlite3");
const sql = new SQLite(`${__dirname}/data.sqlite`);

const onStart = async () => {
  sql
    .prepare(
      `CREATE TABLE IF NOT EXISTS translations(chatId STRING, username STRING, message STRING, language STRING, accuracy STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
    )
    .run();
  sql
    .prepare(
      `CREATE TABLE IF NOT EXISTS optouts(userId STRING, reason STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
    )
    .run();
};

module.exports = {
  onStart,
};
