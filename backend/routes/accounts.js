"use strict";
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const accountController = require("../controllers/accountController");

router.use(requireAuth);
router.get("/", accountController.list);
router.get("/:id", accountController.getById);

module.exports = router;
