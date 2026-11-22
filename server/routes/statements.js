"use strict";
const express = require("express");
const router = express.Router();
const { store } = require("../models/dbStore");

router.get("/", async (req, res) => {
  const { accountId, from, to } = req.query || {};
  const accounts = await store.getAccounts();
  const acc = accounts.find((a) => a.id === (accountId || "a1")) || accounts[0];

  const allTx = await store.getTransactions();
  const rows = allTx.filter((t) => {
    if (t.status !== "completed") return false;
    if (acc && t.accountId !== acc.id) return false;
    if (from && t.date.slice(0, 10) < from) return false;
    if (to && t.date.slice(0, 10) > to) return false;
    return true;
  });

  const credits = rows.filter((r) => r.type === "credit").reduce((s, r) => s + r.amount, 0);
  const debits = rows.filter((r) => r.type === "debit").reduce((s, r) => s + r.amount, 0);
  const balance = acc ? acc.balance : 0;
  const opening = balance - credits + debits;

  res.json({
    rows,
    credits,
    debits,
    opening,
    closing: balance,
    account: acc,
  });
});

module.exports = router;
