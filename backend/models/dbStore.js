"use strict";
const mongoose = require("mongoose");
const User = require("./User");
const Account = require("./Account");
const Transaction = require("./Transaction");

const isConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// Seed data
const SEED_USER = {
  name: "Aarav Patel",
  email: "demo@finova.com",
  password: "Demo@1234",
  mobile: "+91 98765 43210",
};

const SEED_ACCOUNTS = [
  {
    id: "a1",
    type: "Savings Account",
    number: "50100234561234",
    balance: 248650,
    available: 246150,
    status: "Active",
    ifsc: "FNVA0001024",
    branch: "Andheri West, Mumbai",
    opened: "2021-03-14",
  },
  {
    id: "a2",
    type: "Current Account",
    number: "50100987654321",
    balance: 112300,
    available: 112300,
    status: "Active",
    ifsc: "FNVA0001024",
    branch: "Andheri West, Mumbai",
    opened: "2023-08-02",
  },
];

const CATEGORIES = ["Food", "Shopping", "Travel", "Bills", "Entertainment", "Education", "Healthcare", "Other"];
const MERCHANTS = {
  Food: ["Swiggy", "Zomato", "Cafe Coffee Day"],
  Shopping: ["Amazon", "Myntra", "Flipkart"],
  Travel: ["Uber", "Ola", "IRCTC"],
  Bills: ["Airtel", "Electricity Board", "Jio Fiber"],
  Entertainment: ["Netflix", "BookMyShow", "Spotify"],
  Education: ["Udemy", "Coursera"],
  Healthcare: ["Apollo Pharmacy"],
  Other: ["ATM Cash"],
};

let seedRnd = 7;
const rnd = () => (seedRnd = (seedRnd * 9301 + 49297) % 233280) / 233280;

const SEED_TRANSACTIONS = (() => {
  const t = [];
  for (let i = 0; i < 48; i++) {
    const d = new Date(2026, 9, 2, 10);
    d.setHours(d.getHours() - i * 14);
    const base = {
      id: `TXN${100200 + i}`,
      ref: `REF${9000000 + i * 37}`,
      date: d.toISOString(),
      accountId: i % 5 === 0 ? "a2" : "a1",
    };
    if (i === 5) {
      t.push({ ...base, desc: "Salary - Acme Corp", category: "Income", type: "credit", amount: 85000, status: "completed" });
      continue;
    }
    if (i % 9 === 4) {
      t.push({ ...base, desc: "Interest Credit", category: "Income", type: "credit", amount: Math.round(200 + rnd() * 900), status: "completed" });
      continue;
    }
    const c = CATEGORIES[Math.floor(rnd() * CATEGORIES.length)];
    const m = MERCHANTS[c][Math.floor(rnd() * MERCHANTS[c].length)];
    t.push({
      ...base,
      desc: m,
      category: c,
      type: "debit",
      amount: Math.round((150 + rnd() * 3000) / 10) * 10,
      status: i % 13 === 7 ? "pending" : i % 17 === 3 ? "failed" : i % 19 === 6 ? "reversed" : i % 23 === 8 ? "review" : "completed",
    });
  }
  return t;
})();

// In-memory state
let memUsers = [{ ...SEED_USER }];
let memAccounts = JSON.parse(JSON.stringify(SEED_ACCOUNTS));
let memTransactions = JSON.parse(JSON.stringify(SEED_TRANSACTIONS));

// Database seeding helper
let isSeeded = false;
async function ensureDbSeed() {
  if (!isConnected() || isSeeded) return;
  try {
    const count = await Account.countDocuments();
    if (count === 0) {
      await User.create(SEED_USER).catch(() => {});
      await Account.insertMany(SEED_ACCOUNTS).catch(() => {});
      await Transaction.insertMany(SEED_TRANSACTIONS).catch(() => {});
    }
    isSeeded = true;
  } catch (err) {
    // Ignore seed failure
  }
}

const store = {
  async findUser(email) {
    if (isConnected()) {
      await ensureDbSeed();
      const u = await User.findOne({ email: email.toLowerCase() });
      if (u) return u;
    }
    return memUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(data) {
    if (isConnected()) {
      await ensureDbSeed();
      return await User.create(data);
    }
    const u = { ...data, createdAt: new Date().toISOString() };
    memUsers.push(u);
    return u;
  },

  async getAccounts() {
    if (isConnected()) {
      await ensureDbSeed();
      const accs = await Account.find().lean();
      if (accs.length) return accs;
    }
    return memAccounts;
  },

  async getAccountById(id) {
    if (isConnected()) {
      await ensureDbSeed();
      const acc = await Account.findOne({ id }).lean();
      if (acc) return acc;
    }
    return memAccounts.find((a) => a.id === id) || null;
  },

  async updateAccountBalance(id, delta) {
    if (isConnected()) {
      await ensureDbSeed();
      await Account.updateOne({ id }, { $inc: { balance: delta, available: delta } });
    }
    const acc = memAccounts.find((a) => a.id === id);
    if (acc) {
      acc.balance += delta;
      acc.available += delta;
    }
    return acc;
  },

  async getTransactions(filter = {}) {
    let list = memTransactions;
    if (isConnected()) {
      await ensureDbSeed();
      const query = {};
      if (filter.accountId) query.accountId = filter.accountId;
      if (filter.category) query.category = filter.category;
      if (filter.type) query.type = filter.type;
      if (filter.status) query.status = filter.status;
      const docs = await Transaction.find(query).lean();
      if (docs.length) list = docs;
    }
    return list;
  },

  async getTransactionById(id) {
    if (isConnected()) {
      await ensureDbSeed();
      const t = await Transaction.findOne({ id }).lean();
      if (t) return t;
    }
    return memTransactions.find((t) => t.id === id) || null;
  },

  async addTransaction(data) {
    const t = {
      id: data.id || `TXN${Date.now().toString().slice(-6)}`,
      ref: data.ref || `REF${Date.now()}`,
      date: data.date || new Date().toISOString(),
      status: data.status || "completed",
      remarks: data.remarks || "",
      ...data,
    };
    if (isConnected()) {
      await ensureDbSeed();
      await Transaction.create(t).catch(() => {});
    }
    memTransactions.unshift(t);
    return t;
  },
};

module.exports = { store, SEED_USER };
