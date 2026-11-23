"use strict";
const { store } = require("../models/dbStore");

async function list(req, res) {
  const accounts = await store.getAccounts();
  res.json(accounts);
}

async function getById(req, res) {
  const { id } = req.params;
  const account = await store.getAccountById(id);
  if (!account) {
    return res.status(404).json({ message: "Account not found", code: "not_found" });
  }
  res.json(account);
}

module.exports = {
  list,
  getById,
};
