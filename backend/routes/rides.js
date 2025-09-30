const express = require("express");
const router = express.Router();
const db = require("../db");
const fetch = require("node-fetch"); // use node-fetch@2

// --- Geocoding helper ---
async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Geocoding failed:", data);
    throw new Error(`Geocoding failed for: ${address}`);
  }

  return data.results[0].geometry.location; // { lat, lng }
}

// --- Directions helper ---
async function getRoutePolyline(originCoords, destCoords) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originCoords.lat},${originCoords.lng}&destination=${destCoords.lat},${destCoords.lng}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK") {
    console.error("Directions failed:", data);
    throw new Error("Failed to fetch route directions");
  }

  return data.routes[0].overview_polyline.points; // encoded polyline
}

// --- POST /rides/create → add a ride with geocoded coords + route ---
router.post("/create", async (req, res) => {
  const { origin, destination, time, driver, seats_left } = req.body;

  try {
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);
    const routePolyline = await getRoutePolyline(originCoords, destCoords);

    db.run(
      `INSERT INTO rides (
        origin, destination, time, driver, seats_left,
        origin_lat, origin_lng, destination_lat, destination_lng, route_polyline
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        origin,
        destination,
        time,
        driver,
        seats_left,
        originCoords.lat,
        originCoords.lng,
        destCoords.lat,
        destCoords.lng,
        routePolyline,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
      }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET /rides/search → find rides ---
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

// --- POST /rides/join/:id → join a ride ---
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

// --- GET /rides/myrides/:driver → show rides created by a driver ---
router.get("/myrides/:driver", (req, res) => {
  const driver = req.params.driver;

  db.all(`SELECT * FROM rides WHERE driver = ?`, [driver], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
