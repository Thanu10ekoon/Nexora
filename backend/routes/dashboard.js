const express = require("express");
const router = express.Router();

router.get("/stats", async (req, res) => {
  res.json({ totalStudents: 50, totalEvents: 10, pendingUpdates: 5, activeBuses: 8 });
});

module.exports = router;
