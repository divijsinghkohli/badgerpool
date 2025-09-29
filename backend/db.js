const sqlite3 = require("sqlite3").verbose();

// Create or open a database file called rides.db
const db = new sqlite3.Database("./rides.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT,
    destination TEXT,
    time TEXT,
    driver TEXT,
    seats_left INTEGER
  )`);
});

module.exports = db;
