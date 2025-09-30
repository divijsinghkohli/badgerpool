const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "rides.db");
const db = new sqlite3.Database(dbPath);

// Initialize schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS rides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT,
    destination TEXT,
    time TEXT,
    driver TEXT,
    seats_left INTEGER,
    origin_lat REAL,
    origin_lng REAL,
    destination_lat REAL,
    destination_lng REAL,
    route_polyline TEXT
  )`);
});

module.exports = db;
