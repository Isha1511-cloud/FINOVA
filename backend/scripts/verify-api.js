"use strict";
/**
 * End-to-end verification against a REAL MongoDB (your Atlas dev DB or a local mongod).
 *   npm run seed && npm run verify:api
 * Boots the app in-process, exercises every endpoint over HTTP, proves ownership isolation with a
 * throwaway second user (deleted afterwards), and prints PASS/FAIL per check. Never prints secrets.
 */
const crypto = require("crypto");
const mongoose = require("mongoose");
const { getConfig } = require("../config/env");
const { connectDB, disconnectDB } = require("../config/db");

async function run() {
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = crypto.randomBytes(32).toString("hex"); // ephemeral, in-memory only
  const { createApp } = require("../app");
  const User = require("../models/User");
  const Account = require("../models/Account");
  const Transaction = require("../models/Transaction");
  const { DEMO_USER } = require("./seed");

  const results = [];
  const check = (name, ok, extra = "") => { results.push({ name, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : extra ? "  -> " + extra : ""}`); };

  await connectDB({ config: getConfig() });
  const server = createApp(getConfig()).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, { token, body } = {}) => {
    const r = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    let json = null; try { json = await r.json(); } catch { /* empty */ }
    return { status: r.status, json };
  };

  const tmpEmail = `verify.${Date.now()}@finova.test`;
  try {
    check("health reports DB connected", (await call("GET", "/api/health")).json?.db === "connected");

    // --- unauthenticated access is rejected
    for (const p of ["/api/accounts", "/api/transactions", "/api/dashboard/summary"]) {
      check(`401 without token: GET ${p}`, (await call("GET", p)).status === 401);
    }
    check("401 with garbage token", (await call("GET", "/api/accounts", { token: "abc.def.ghi" })).status === 401);

    // --- login as seeded demo user
    const bad = await call("POST", "/api/auth/login", { body: { email: DEMO_USER.email, password: "wrong-password" } });
    check("login rejects wrong password (401)", bad.status === 401);
    const login = await call("POST", "/api/auth/login", { body: { email: DEMO_USER.email, password: process.env.SEED_DEMO_PASSWORD || "Demo@1234" } });
    check("demo user login succeeds and returns token", login.status === 200 && !!login.json?.token, `status ${login.status} (did you run npm run seed?)`);
    check("login response does not leak password", !JSON.stringify(login.json).toLowerCase().includes("password\":"));
    const token = login.json?.token;
    if (!token) throw new Error("Cannot continue without a demo token.");

    // --- accounts
    const accs = await call("GET", "/api/accounts", { token });
    check("GET /api/accounts returns 2 demo accounts", accs.status === 200 && Array.isArray(accs.json) && accs.json.length >= 2);
    check("account numbers are masked", accs.json.every((a) => /^X+\d{4}$/.test(a.accountNumber)));
    const acc = accs.json[0];
    const one = await call("GET", `/api/accounts/${acc.id}`, { token });
    check("GET /api/accounts/:id returns own account", one.status === 200 && one.json.id === acc.id);
    check("GET /api/accounts/:id with invalid id -> 404", (await call("GET", "/api/accounts/not-an-id", { token })).status === 404);

    // --- transactions
    const txs = await call("GET", "/api/transactions?pageSize=5", { token });
    check("GET /api/transactions returns items + total", txs.status === 200 && txs.json.items.length === 5 && txs.json.total >= 20);
    const filt = await call("GET", "/api/transactions?type=credit&status=completed", { token });
    check("transactions filter by type works", filt.json.items.every((t) => t.type === "credit") && filt.json.total > 0);
    const tx = txs.json.items[0];
    check("GET /api/transactions/:id returns own tx", (await call("GET", `/api/transactions/${tx.id}`, { token })).status === 200);
    check("GET /api/transactions/:id works by referenceId", (await call("GET", `/api/transactions/${tx.referenceId}`, { token })).status === 200);

    // --- dashboard
    const dash = await call("GET", "/api/dashboard/summary?days=60", { token });
    const calcIncome = txs.json && (await Transaction.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(login.json.user.id), status: "completed", type: "credit", transactionDate: { $gte: new Date(Date.now() - 60 * 864e5) } } }, { $group: { _id: null, t: { $sum: "$amount" } } }]))[0]?.t || 0;
    check("dashboard summary 200 with balance/income/expenses/recent", dash.status === 200 && dash.json.totalBalance > 0 && dash.json.income > 0 && dash.json.expenses > 0 && dash.json.recentTransactions.length > 0);
    check("dashboard income matches independent DB aggregation", dash.json.income === calcIncome, `api=${dash.json?.income} db=${calcIncome}`);

    check("dashboard has 6-month series and this-month figures", dash.json.monthly?.length === 6 && typeof dash.json.month?.income === "number" && Array.isArray(dash.json.month?.categories));
    check("dashboard monthly series is consistent with this-month totals", dash.json.monthly[5].income === dash.json.month.income && dash.json.monthly[5].spend === dash.json.month.expenses);

    // --- ownership isolation with a second user
    const reg = await call("POST", "/api/auth/register", { body: { name: "Verify Temp", email: tmpEmail, password: "Temp#Pass1234" } });
    check("registration creates user and returns token", reg.status === 201 && !!reg.json?.token);
    check("duplicate registration -> 409", (await call("POST", "/api/auth/register", { body: { name: "Verify Temp", email: tmpEmail, password: "Temp#Pass1234" } })).status === 409);
    const t2 = reg.json?.token;
    const own = await call("GET", "/api/accounts", { token: t2 });
    check("new user sees zero accounts (empty state)", own.status === 200 && own.json.length === 0);
    check("new user CANNOT read demo user's account by id (404)", (await call("GET", `/api/accounts/${acc.id}`, { token: t2 })).status === 404);
    check("new user CANNOT read demo user's transaction by id (404)", (await call("GET", `/api/transactions/${tx.id}`, { token: t2 })).status === 404);
    const spoof = await call("GET", `/api/transactions?userId=${login.json.user.id}&accountId=${acc.id}`, { token: t2 });
    check("userId/accountId query spoofing returns nothing", spoof.status === 200 && spoof.json.total === 0);
    const dep = await call("POST", "/api/deposits", { token: t2, body: { accountId: acc.id, amount: 100, userId: login.json.user.id } });
    check("new user CANNOT deposit into demo user's account (404)", dep.status === 404);
    check("new user dashboard is empty, not demo data", (await call("GET", "/api/dashboard/summary", { token: t2 })).json.totalBalance === 0);
  } catch (e) {
    check(`unexpected error: ${e.message}`, false);
  } finally {
    const u = await User.findOne({ email: tmpEmail }).lean();
    if (u) { await Account.deleteMany({ userId: u._id }); await Transaction.deleteMany({ userId: u._id }); await User.deleteOne({ _id: u._id }); }
    await new Promise((r) => server.close(r));
    await disconnectDB();
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed.`);
  return failed;
}

if (require.main === module) run().then((f) => process.exit(f ? 1 : 0)).catch((e) => { console.error("verify failed:", e.message); process.exit(1); });
module.exports = { run };
