// Logic tests with a stubbed mongoose.connect (no real DB needed).
const test = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const cfg = { errors: [], mongoUri: "mongodb://u:p@h/db", retries: 3, retryDelayMs: 1, serverSelectionTimeoutMS: 100 };

test("retries on transient failure then succeeds", async () => {
  const orig = mongoose.connect; let n = 0;
  mongoose.connect = async () => { if (++n < 3) { const e = new Error("Server selection timed out"); e.name = "MongooseServerSelectionError"; throw e; } };
  try { await connectDB({ config: cfg }); assert.strictEqual(n, 3); } finally { mongoose.connect = orig; }
});

test("does not retry on authentication failure", async () => {
  const orig = mongoose.connect; let n = 0;
  mongoose.connect = async () => { n++; const e = new Error("bad auth : Authentication failed."); e.name = "MongoServerError"; throw e; };
  try { await assert.rejects(connectDB({ config: cfg }), /Database connection failed/); assert.strictEqual(n, 1); } finally { mongoose.connect = orig; }
});

test("invalid config throws CONFIG_INVALID before connecting", async () => {
  await assert.rejects(connectDB({ config: { ...cfg, errors: ["x"] } }), (e) => e.code === "CONFIG_INVALID");
});
