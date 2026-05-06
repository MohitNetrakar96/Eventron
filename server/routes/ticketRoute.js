const express = require("express");
const router = express.Router();
const { getTicket } = require("../controllers/ticketController");

// GET /ticket/:passId — public route, no auth needed (scanned by anyone at event)
router.get("/ticket/:passId", getTicket);

module.exports = router;
