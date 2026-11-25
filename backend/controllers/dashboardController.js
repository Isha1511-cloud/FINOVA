"use strict";
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const { serializeAccount, serializeTransaction } = require("../utils/serializers");
const { toObjectId, qstr } = require("../utils/http");

// GET /api/dashboard/summary?days=30&recent=5
// Income / expenses count completed transactions in the last `days` days.
async function summary(req, res) {
  const userId = toObjectId(req.user.id);
  const days = Math.min(365, Math.max(1, parseInt(qstr(req.query.days), 10) || 30));
  const recent = Math.min(20, Math.max(1, parseInt(qstr(req.query.recent), 10) || 5));
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

  const [accounts, flow, byCategory, recentTx] = await Promise.all([
    Account.find({ userId }).sort({ createdAt: 1 }).lean(),
    Transaction.aggregate([
      { $match: { userId, status: "completed", transactionDate: { $gte: from, $lte: to } } },
      { $group: { _id: { currency: "$currency", type: "$type" }, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, status: "completed", type: "debit", transactionDate: { $gte: from, $lte: to } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
    Transaction.find({ userId }).sort({ transactionDate: -1, _id: -1 }).limit(recent).lean(),
  ]);

  const activeAccounts = accounts.filter((a) => a.status !== "closed");
  const primaryCurrency = (activeAccounts[0] && activeAccounts[0].currency) || "INR";

  const totalsMap = {};
  for (const a of activeAccounts) totalsMap[a.currency] = (totalsMap[a.currency] || 0) + a.balance;
  const totals = Object.entries(totalsMap).map(([currency, balance]) => ({ currency, balance }));

  const sumFlow = (type) =>
    flow.filter((r) => r._id.type === type && r._id.currency === primaryCurrency).reduce((s, r) => s + r.total, 0);
  const income = sumFlow("credit");
  const expenses = sumFlow("debit");

  res.json({
    currency: primaryCurrency,
    totalBalance: totalsMap[primaryCurrency] || 0,
    totals,
    income,
    expenses,
    net: income - expenses,
    period: { days, from: from.toISOString(), to: to.toISOString() },
    accountCount: accounts.length,
    accounts: accounts.map(serializeAccount),
    spendingByCategory: byCategory.map((c) => ({ category: c._id, total: c.total, count: c.count })),
    recentTransactions: recentTx.map(serializeTransaction),
  });
}

module.exports = { summary };
