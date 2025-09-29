const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /rides/create → add a ride
router.post("/create", (req, res) => {
  const { origin, destination, time, driver, seats_left } = req.body;

  db.run(
    `INSERT INTO rides (origin, destination, time, driver, seats_left) VALUES (?, ?, ?, ?, ?)`,
    [origin, destination, time, driver, seats_left],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

// GET /rides/search → find rides
router.get("/search", (req, res) => {
  const { origin = "", destination = "" } = req.query;

  db.all(
    `SELECT * FROM rides WHERE origin LIKE ? AND destination LIKE ?`,
    [`%${origin}%`, `%${destination}%`],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// POST /rides/join/:id → join a ride
router.post("/join/:id", (req, res) => {
  const rideId = req.params.id;

  db.run(
    `UPDATE rides SET seats_left = seats_left - 1 WHERE id = ? AND seats_left > 0`,
    [rideId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(400).json({ error: "No seats left" });
      }
      res.json({ success: true });
    }
  );
});

// GET /rides/myrides/:driver → show rides created by a driver
router.get("/myrides/:driver", (req, res) => {
  const driver = req.params.driver;

  db.all(
    `SELECT * FROM rides WHERE driver = ?`,
    [driver],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

module.exports = router;
