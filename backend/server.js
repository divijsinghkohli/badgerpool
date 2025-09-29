const express = require("express");
const cors = require("cors");
const db = require("./db");
const ridesRouter = require("./routes/rides");

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
