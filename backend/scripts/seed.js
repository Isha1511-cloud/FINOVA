"use strict";
/**
 * Idempotent seed for DEVELOPMENT / PROJECT DEMONSTRATION.
 *   npm run seed                 -> create missing demo records (safe to re-run; no duplicates)
 *   npm run seed -- --clean-legacy -> also delete accounts/transactions from the old pre-userId schema
 *
 * Everything created here is FICTIONAL and flagged isDemo:true. Account numbers are made-up
 * and are not real bank details. Refuses to run when NODE_ENV=production unless ALLOW_SEED=true.
 */
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { getConfig } = require("../config/env");
const { connectDB, disconnectDB } = require("../config/db");
const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const DEMO_USER = {
  name: "Aarav Patel (Demo)",
  email: "demo@finova.com",
  mobile: "+91 90000 00000",
};
// Development-only credential for the fictional demo user. Override with SEED_DEMO_PASSWORD.
const demoPassword = () => process.env.SEED_DEMO_PASSWORD || "Demo@1234";

const DEMO_ACCOUNTS = [
  { accountType: "savings", accountNumber: "900000000001", balance: 248650, opened: "2021-03-14" },
  { accountType: "current", accountNumber: "900000000002", balance: 112300, opened: "2023-08-02" },
];

// [daysAgo, accountIndex, type, category, description, amount, status]
const DEMO_TX = [
  [1, 0, "debit", "Food", "Swiggy (demo)", 640, "completed"],
  [2, 0, "debit", "Travel", "Uber (demo)", 380, "completed"],
  [3, 0, "debit", "Shopping", "Amazon (demo)", 2499, "completed"],
  [4, 1, "debit", "Bills", "Airtel Postpaid (demo)", 799, "completed"],
  [5, 0, "credit", "Income", "Salary - Acme Corp (demo)", 85000, "completed"],
  [6, 0, "debit", "Entertainment", "Netflix (demo)", 649, "completed"],
  [7, 0, "debit", "Food", "Zomato (demo)", 520, "completed"],
  [8, 0, "debit", "Healthcare", "Apollo Pharmacy (demo)", 1180, "completed"],
  [9, 1, "credit", "Income", "Client Payment - Invoice 1042 (demo)", 32000, "completed"],
  [10, 0, "debit", "Education", "Udemy (demo)", 449, "completed"],
  [11, 0, "debit", "Bills", "Electricity Board (demo)", 2140, "completed"],
  [12, 0, "debit", "Shopping", "Myntra (demo)", 1799, "pending"],
  [13, 0, "debit", "Travel", "IRCTC (demo)", 1260, "completed"],
  [14, 0, "credit", "Income", "Interest Credit (demo)", 612, "completed"],
  [15, 1, "debit", "Other", "ATM Cash (demo)", 5000, "completed"],
  [16, 0, "debit", "Food", "Cafe Coffee Day (demo)", 310, "completed"],
  [18, 0, "debit", "Entertainment", "BookMyShow (demo)", 900, "failed"],
  [19, 0, "debit", "Bills", "Jio Fiber (demo)", 999, "completed"],
  [21, 0, "debit", "Shopping", "Flipkart (demo)", 3299, "reversed"],
  [23, 0, "debit", "Food", "Swiggy (demo)", 710, "completed"],
  [26, 1, "debit", "Bills", "Office Rent (demo)", 18000, "completed"],
  [28, 0, "debit", "Travel", "Ola (demo)", 295, "completed"],
  [31, 0, "credit", "Income", "Salary - Acme Corp (demo)", 85000, "completed"],
  [34, 0, "debit", "Healthcare", "Clinic Visit (demo)", 800, "completed"],
  [38, 1, "credit", "Income", "Client Payment - Invoice 1031 (demo)", 24000, "completed"],
  [41, 0, "debit", "Shopping", "Amazon (demo)", 1599, "completed"],
];

async function seedDatabase({ clean = false, log = logger } = {}) {
  const stats = { users: 0, accounts: 0, transactions: 0, cleaned: 0, repairedPassword: false };

  if (clean) {
    const a = await Account.deleteMany({ userId: { $exists: false } });
    const t = await Transaction.deleteMany({ userId: { $exists: false } });
    stats.cleaned = (a.deletedCount || 0) + (t.deletedCount || 0);
  }

  // Align indexes with the current schema. This also drops stale indexes left by the old schema
  // (e.g. the unique `id_1` index, which would make new documents collide on a missing `id`).
  await Promise.all([User.syncIndexes(), Account.syncIndexes(), Transaction.syncIndexes()]);

  // --- user (upsert by email; never overwrites an existing password) ---
  const hash = await bcrypt.hash(demoPassword(), 12);
  const r = await User.updateOne(
    { email: DEMO_USER.email },
    { $setOnInsert: { ...DEMO_USER, password: hash, role: "customer", status: "active", isDemo: true } },
    { upsert: true }
  );
  stats.users = r.upsertedCount || 0;
  const user = await User.findOne({ email: DEMO_USER.email }).select("+password");

  // The previous implementation stored this user's password in plain text. Repair it so login works.
  if (user.password && !/^\$2[aby]\$/.test(user.password)) {
    await User.updateOne({ _id: user._id }, { $set: { password: hash } });
    stats.repairedPassword = true;
  }

  // --- accounts (upsert by accountNumber) ---
  const accountDocs = [];
  for (const a of DEMO_ACCOUNTS) {
    const res = await Account.updateOne(
      { accountNumber: a.accountNumber },
      { $setOnInsert: { ...a, userId: user._id, available: a.balance, currency: "INR", status: "active", isDemo: true } },
      { upsert: true }
    );
    stats.accounts += res.upsertedCount || 0;
    const doc = await Account.findOne({ accountNumber: a.accountNumber });
    if (String(doc.userId) !== String(user._id)) {
      throw new Error("A non-demo account already uses a reserved demo account number; aborting seed.");
    }
    accountDocs.push(doc);
  }

  // --- transactions (upsert by referenceId) ---
  const now = new Date();
  const ops = DEMO_TX.map(([daysAgo, ai, type, category, description, amount, status], i) => {
    const when = new Date(now);
    when.setUTCDate(when.getUTCDate() - daysAgo);
    when.setUTCHours(9 + (i % 9), (i * 7) % 60, 0, 0);
    const referenceId = `DEMO-TXN-${String(i + 1).padStart(4, "0")}`;
    return {
      updateOne: {
        filter: { referenceId },
        update: {
          $setOnInsert: {
            referenceId, userId: user._id, accountId: accountDocs[ai]._id, type, category, description,
            amount, currency: "INR", status, transactionDate: when, isDemo: true,
          },
        },
        upsert: true,
      },
    };
  });
  const bulk = await Transaction.bulkWrite(ops);
  stats.transactions = bulk.upsertedCount || 0;

  log.info(
    `Seed complete. Inserted: users=${stats.users}, accounts=${stats.accounts}, transactions=${stats.transactions}` +
      (stats.cleaned ? `; removed legacy docs=${stats.cleaned}` : "") +
      (stats.repairedPassword ? "; repaired demo user's password hash" : "") +
      ". (0 inserted on a re-run is expected: no duplicates are created.)"
  );
  return stats;
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    logger.error("Refusing to seed with NODE_ENV=production. Set ALLOW_SEED=true only if you really intend this.");
    process.exit(1);
  }
  const clean = process.argv.includes("--clean-legacy");
  try {
    await connectDB({ config: getConfig() });
    await seedDatabase({ clean });
    await disconnectDB();
    process.exit(0);
  } catch (e) {
    logger.error("Seed failed:", e.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { seedDatabase, DEMO_USER, DEMO_ACCOUNTS, DEMO_TX };
