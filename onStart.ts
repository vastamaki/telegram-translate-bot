import { Database } from "bun:sqlite";

const sql = new Database("data.sqlite");

export const onStart = async () => {
  sql.run(
    `CREATE TABLE IF NOT EXISTS translations(chatId STRING, username STRING, message STRING, language STRING, accuracy STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
  );
  sql.run(
    `CREATE TABLE IF NOT EXISTS optouts(userId STRING, reason STRING, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`
  );
};
