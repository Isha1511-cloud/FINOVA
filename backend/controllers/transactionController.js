"use strict";
const { store } = require("../models/dbStore");

async function list(req, res) {
  const {
    q = "",
    category = "",
    type = "",
    status = "",
    sort = "date-desc",
    page = 1,
    pageSize = 10,
    from = "",
    to = "",
    accountId = "",
    min = "",
    max = "",
  } = req.query || {};

  const txList = await store.getTransactions();

  let filtered = txList.filter((t) => {
    if (q && !(t.desc + t.id).toLowerCase().includes(q.toLowerCase())) return false;
    if (category && t.category !== category) return false;
    if (type) {
      if (type === "transfer" && !t.desc.startsWith("Transfer")) return false;
      if (type !== "transfer" && t.type !== type) return false;
    }
    if (min && t.amount < Number(min)) return false;
    if (max && t.amount > Number(max)) return false;
    if (status && t.status !== status) return false;
    if (accountId && t.accountId !== accountId) return false;
    if (from && t.date.slice(0, 10) < from) return false;
    if (to && t.date.slice(0, 10) > to) return false;
    return true;
  });

  const [field, direction] = sort.split("-");
  filtered.sort((a, b) => {
    const diff = field === "date" ? new Date(a.date) - new Date(b.date) : a.amount - b.amount;
    return direction === "asc" ? diff : -diff;
  });

  const p = Math.max(1, Number(page));
  const ps = Math.max(1, Number(pageSize));
  const start = (p - 1) * ps;
  const items = filtered.slice(start, start + ps);

  res.json({
    items,
    total: filtered.length,
    all: filtered,
  });
}

async function getById(req, res) {
  const { id } = req.params;
  const t = await store.getTransactionById(id);
  if (!t) {
    return res.status(404).json({ message: "Transaction not found", code: "not_found" });
  }
  res.json(t);
}

async function handleCashFlow(req, res, kind) {
  const { accountId, amount, remarks } = req.body || {};
  const amt = Number(amount);
  if (!accountId || !amt || amt <= 0) {
    return res.status(400).json({ message: "Valid accountId and amount are required.", code: "validation" });
  }

  const account = await store.getAccountById(accountId);
  if (!account) {
    return res.status(404).json({ message: "Account not found", code: "not_found" });
  }

  if (kind === "withdraw" && amt > account.available) {
    return res.status(400).json({ message: "Insufficient balance.", code: "insufficient" });
  }

  const delta = kind === "deposit" ? amt : -amt;
  await store.updateAccountBalance(accountId, delta);

  const txn = await store.addTransaction({
    accountId,
    desc: kind === "deposit" ? "Cash Deposit" : "Cash Withdrawal",
    category: "Other",
    type: kind === "deposit" ? "credit" : "debit",
    amount: amt,
    status: "completed",
    remarks: remarks || "",
  });

  res.json({ status: "completed", transaction: txn });
}

async function deposit(req, res) {
  return handleCashFlow(req, res, "deposit");
}

async function withdraw(req, res) {
  return handleCashFlow(req, res, "withdraw");
}

module.exports = {
  list,
  getById,
  deposit,
  withdraw,
};
