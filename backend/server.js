const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");
const ridesRouter = require("./routes/rides");

dotenv.config(); // load .env variables
console.log("Loaded API key:", JSON.stringify(process.env.GOOGLE_MAPS_API_KEY));
const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("BadgerPool backend is running");
});

// use rides router
app.use("/rides", ridesRouter);

const PORT = 8000; // your port
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
