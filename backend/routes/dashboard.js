"use strict";
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const dashboardController = require("../controllers/dashboardController");

router.get("/summary", requireAuth, dashboardController.summary);

module.exports = router;
