"use strict";
const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { requireAuth } = require("../middleware/auth");
const { serializeAccount, serializeTransaction } = require("../utils/serializers");
const { isObjectIdString, toObjectId, qstr } = require("../utils/http");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const accountId = qstr(req.query.accountId);
    const from = qstr(req.query.from);
    const to = qstr(req.query.to);

    const owner = { userId: req.user.id };
    const acc = isObjectIdString(accountId)
      ? await Account.findOne({ _id: accountId, ...owner }).lean()
      : await Account.findOne(owner).sort({ createdAt: 1 }).lean();
    if (!acc) return res.status(404).json({ message: "Account not found", code: "not_found" });

    const filter = { userId: toObjectId(req.user.id), accountId: acc._id, status: "completed" };
    const date = {};
    if (DATE_RE.test(from)) date.$gte = new Date(`${from}T00:00:00.000Z`);
    if (DATE_RE.test(to)) date.$lte = new Date(`${to}T23:59:59.999Z`);
    if (Object.keys(date).length) filter.transactionDate = date;

    const docs = await Transaction.find(filter).sort({ transactionDate: -1, _id: -1 }).limit(5000).lean();
    const credits = docs.filter((r) => r.type === "credit").reduce((s, r) => s + r.amount, 0);
    const debits = docs.filter((r) => r.type === "debit").reduce((s, r) => s + r.amount, 0);

    res.json({
      rows: docs.map(serializeTransaction),
      credits,
      debits,
      opening: acc.balance - credits + debits,
      closing: acc.balance,
      account: serializeAccount(acc),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
