const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Path to stats file
const statsFilePath = path.join(__dirname, "aggregated-stats.json");

// Initialize aggregated-stats.json if it doesn't exist
if (!fs.existsSync(statsFilePath)) {
  fs.writeFileSync(statsFilePath, JSON.stringify({}, null, 2));
}

// Endpoint to get aggregated stats
app.get("/stats", (req, res) => {
  const stats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));
  res.json(stats);
});

// Endpoint to update stats
app.post("/update-stats", (req, res) => {
  const { country } = req.body;

  // Read existing stats
  const stats = JSON.parse(fs.readFileSync(statsFilePath, "utf-8"));

  // Update stats for the country
  if (!stats[country]) {
    stats[country] = 0;
  }
  stats[country]++;

  // Write updated stats back to the file
  fs.writeFileSync(statsFilePath, JSON.stringify(stats, null, 2));

  res.status(200).send("Stats updated successfully.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
