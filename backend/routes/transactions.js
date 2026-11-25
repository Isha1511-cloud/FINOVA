"use strict";
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");

router.use(requireAuth);
router.get("/", transactionController.list);
router.get("/:id", transactionController.getById);

module.exports = router;
