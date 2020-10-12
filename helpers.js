const SQLite = require("better-sqlite3");
const sql = new SQLite(`./data.sqlite`);

const saveToDb = (data, table) => {
  const keys = Object.keys(data);
  let insert = "";
  Object.keys(data).forEach((i, idx, array) => {
    if (idx === array.length - 1) {
      insert = insert + `'${data[i]}'`;
    } else {
      insert = insert + `'${data[i]}',`;
    }
  });
  const sqlQuery = `INSERT INTO ${table} (${keys.map(
    (key) => `${key}`
  )}) VALUES (${insert})`;
  sql.prepare(sqlQuery).run();
};

const getStats = (chatId, amount) => {
  let message = "";
  const last_10_rows = sql
    .prepare(
      `SELECT * FROM translations WHERE chatId = ? ORDER BY timestamp DESC LIMIT ?`
    )
    .all(chatId, amount || 5);

      console.log(last_10_rows)

  last_10_rows.forEach((row, index) => {
    message += `${index + 1}: ${row.message} ${row.language} ${
      row.accuracy
    }\n\n`;
  });
  return last_10_rows ? message : "No stats yet :(";
};

module.exports = {
  saveToDb,
  getStats,
};
