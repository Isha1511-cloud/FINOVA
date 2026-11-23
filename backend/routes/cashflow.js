"use strict";
const express = require("express");
const transactionController = require("../controllers/transactionController");

const depositsRouter = express.Router();
depositsRouter.post("/", transactionController.deposit);

const withdrawalsRouter = express.Router();
withdrawalsRouter.post("/", transactionController.withdraw);

module.exports = {
  depositsRouter,
  withdrawalsRouter,
};
