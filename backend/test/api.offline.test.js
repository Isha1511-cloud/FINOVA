// Tests that need NO database: auth gate, serializers, validation helpers, app boot.
const test = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");

process.env.TEST_ISOLATION = "1";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123456";
const { createApp } = require("../app");
const { maskAccountNumber } = require("../models/Account");
const { serializeAccount, serializeTransaction } = require("../utils/serializers");
const { isObjectIdString, escapeRegex } = require("../utils/http");
const { rateLimit } = require("../middleware/auth");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

async function withServer(fn) {
  const server = createApp({ corsOrigins: ["*"] }).listen(0);
  try { await fn(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise((r) => server.close(r)); }
}

test("data routes reject missing / malformed / wrong-secret tokens with 401", async () => {
  await withServer(async (base) => {
    const forged = jwt.sign({ id: "64b000000000000000000001" }, "some-other-secret-some-other-secret-1234");
    for (const p of ["/api/accounts", "/api/accounts/64b000000000000000000001", "/api/transactions", "/api/transactions/x", "/api/dashboard/summary", "/api/statements", "/api/auth/me"]) {
      assert.strictEqual((await fetch(base + p)).status, 401, `${p} no token`);
      assert.strictEqual((await fetch(base + p, { headers: { Authorization: "Bearer nope" } })).status, 401, `${p} bad token`);
      assert.strictEqual((await fetch(base + p, { headers: { Authorization: `Bearer ${forged}` } })).status, 401, `${p} forged token`);
    }
    for (const p of ["/api/deposits", "/api/withdrawals"]) {
      assert.strictEqual((await fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 401, p);
    }
  });
});

test("alg:none token is rejected", async () => {
  await withServer(async (base) => {
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const t = `${b64({ alg: "none", typ: "JWT" })}.${b64({ id: "64b000000000000000000001" })}.`;
    assert.strictEqual((await fetch(base + "/api/accounts", { headers: { Authorization: `Bearer ${t}` } })).status, 401);
  });
});

test("valid token but DB down -> 503, not data", async () => {
  await withServer(async (base) => {
    const t = jwt.sign({ id: "64b000000000000000000001" }, process.env.JWT_SECRET);
    assert.strictEqual((await fetch(base + "/api/accounts", { headers: { Authorization: `Bearer ${t}` } })).status, 503);
  });
});

test("register/login validate input before touching the DB", async () => {
  await withServer(async (base) => {
    const post = (p, b) => fetch(base + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    assert.strictEqual((await post("/api/auth/register", { name: "A", email: "bad", password: "12345678" })).status, 400);
    assert.strictEqual((await post("/api/auth/register", { name: "Valid Name", email: "a@b.co", password: "short" })).status, 400);
    assert.strictEqual((await post("/api/auth/login", {})).status, 400);
    assert.strictEqual((await post("/api/auth/login", { email: { $ne: null }, password: { $ne: null } })).status, 400); // NoSQL-injection shape
  });
});

test("account numbers are masked everywhere", () => {
  assert.strictEqual(maskAccountNumber("900000000001"), "XXXXXXXX0001");
  const a = serializeAccount({ _id: "1", accountType: "savings", accountNumber: "900000000001", balance: 5, currency: "INR", status: "active" });
  assert.strictEqual(a.accountNumber, "XXXXXXXX0001");
  assert.strictEqual(a.number, "XXXXXXXX0001");
  assert.ok(!JSON.stringify(a).includes("900000000001"));
  assert.strictEqual(a.type, "Savings Account");
  assert.strictEqual(a.status, "Active");
  const doc = new Account({ userId: "64b000000000000000000001", accountNumber: "900000000001" });
  assert.ok(!JSON.stringify(doc.toJSON()).includes("900000000001"));
});

test("transaction serializer keeps legacy aliases and hides userId", () => {
  const d = new Date("2026-11-01T10:00:00Z");
  const t = serializeTransaction({ _id: "9", accountId: "8", userId: "7", referenceId: "R1", type: "debit", description: "X", amount: 1, transactionDate: d });
  assert.strictEqual(t.desc, "X"); assert.strictEqual(t.ref, "R1"); assert.strictEqual(t.date, d.toISOString());
  assert.strictEqual(t.userId, undefined);
});

test("schemas validate required fields, enums and amounts", async () => {
  const a = new Account({ accountNumber: "12", balance: -5, accountType: "bogus" }).validateSync();
  assert.ok(a.errors.userId && a.errors.accountNumber && a.errors.balance && a.errors.accountType);
  const t = new Transaction({ amount: 0, type: "x" }).validateSync();
  assert.ok(t.errors.accountId && t.errors.userId && t.errors.type && t.errors.amount && t.errors.description && t.errors.referenceId);
  const ok = new Account({ userId: "64b000000000000000000001", accountNumber: "900000000001", balance: 10 });
  await ok.validate(); // runs the pre-validate hook that defaults `available` to `balance`
  assert.strictEqual(ok.available, 10);
});

test("indexes declared for common queries", () => {
  const keys = (m) => m.schema.indexes().map(([k]) => Object.keys(k).join("+"));
  assert.ok(keys(Transaction).includes("userId+transactionDate"));
  assert.ok(keys(Transaction).includes("referenceId"));
  assert.ok(keys(Account).includes("accountNumber"));
});

test("helpers", () => {
  assert.ok(isObjectIdString("64b000000000000000000001")); assert.ok(!isObjectIdString("x")); assert.ok(!isObjectIdString({ $ne: 1 }));
  assert.strictEqual(escapeRegex("a.*b"), "a\\.\\*b");
});

test("rate limiter blocks after max", () => {
  const rl = rateLimit({ windowMs: 1000, max: 2 });
  const res = { set() {}, status(c) { this.code = c; return this; }, json() { return this; } };
  let passed = 0; const next = () => passed++;
  for (let i = 0; i < 4; i++) rl({ ip: "1.1.1.1" }, res, next);
  assert.strictEqual(passed, 2); assert.strictEqual(res.code, 429);
});

test("API shapes contain every field the existing frontend reads", () => {
  const acc = serializeAccount({ _id: "1", accountType: "savings", accountNumber: "900000000001", balance: 5, available: 4, currency: "INR", status: "active", ifsc: "X", branch: "B", opened: "2021-03-14" });
  for (const k of ["id", "type", "number", "balance", "available", "status", "ifsc", "branch", "opened"]) assert.ok(k in acc, `account.${k}`);
  const tx = serializeTransaction({ _id: "2", accountId: "1", referenceId: "R", type: "credit", category: "Income", description: "d", amount: 1, currency: "INR", status: "completed", transactionDate: new Date(), remarks: "" });
  for (const k of ["id", "ref", "date", "accountId", "desc", "category", "type", "amount", "status", "remarks"]) assert.ok(k in tx, `tx.${k}`);
});
