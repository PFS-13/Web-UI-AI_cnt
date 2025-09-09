const express = require("express");
const pool = require("./src/db");

const app = express();

// endpoint test query
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() as server_time");
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB query failed" });
  }
});

app.listen(4000, () => console.log("Node service running on port 4000"));
