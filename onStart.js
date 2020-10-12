const SQLite = require("better-sqlite3");
const sql = new SQLite(`./data.sqlite`);

const onStart = async () => {
  sql
    .prepare(
      `CREATE TABLE IF NOT EXISTS translations(chatId STRING, username STRING, message STRING, language STRING, accuracy STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
    )
    .run();
};

module.exports = {
    onStart
}