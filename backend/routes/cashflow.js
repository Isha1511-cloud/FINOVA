"use strict";
const express = require("express");
const { requireAuth } = require("../middleware/auth");
const transactionController = require("../controllers/transactionController");

const depositsRouter = express.Router();
depositsRouter.post("/", requireAuth, transactionController.deposit);

const withdrawalsRouter = express.Router();
withdrawalsRouter.post("/", requireAuth, transactionController.withdraw);

module.exports = { depositsRouter, withdrawalsRouter };
