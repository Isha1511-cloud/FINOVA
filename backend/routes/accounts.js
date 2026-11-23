"use strict";
const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

router.get("/", accountController.list);
router.get("/:id", accountController.getById);

module.exports = router;
