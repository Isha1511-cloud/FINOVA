const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { spawnSync } = require("child_process");

function loadEnvModule(env) {
  process.env.TEST_ISOLATION = "1";
  // Fresh process-like isolation: clear and reload module with controlled env
  const keys = ["MONGODB_URI", "PORT", "FRONTEND_URL", "MONGODB_DB_NAME"];
  keys.forEach((k) => delete process.env[k]);
  Object.assign(process.env, env);
  delete require.cache[require.resolve("../config/env")];
  return require("../config/env").getConfig();
}

test("missing URI is reported", () => {
  const c = loadEnvModule({});
  assert.ok(c.errors.some((e) => /MONGODB_URI is missing/.test(e)));
});

test("placeholder URI is rejected", () => {
  const c = loadEnvModule({ MONGODB_URI: "[CONNECTION_STRING]" });
  assert.ok(c.errors.some((e) => /placeholder/.test(e)));
});

test("valid URI + placeholder FRONTEND_URL falls back to localhost", () => {
  const c = loadEnvModule({ MONGODB_URI: "mongodb://127.0.0.1:27017/x", FRONTEND_URL: "[FRONTEND_ORIGIN]" });
  assert.deepStrictEqual(c.errors, []);
  assert.deepStrictEqual(c.corsOrigins, ["http://localhost:5173"]);
  assert.ok(c.frontendUrlWasPlaceholder);
});

test("redactUri hides credentials", () => {
  const { redactUri } = require("../config/env");
  assert.ok(!redactUri("mongodb+srv://u:p%40ss@h.mongodb.net/db").includes("p%40ss"));
});

test("explainError maps known failures", () => {
  const { explainError } = require("../config/db");
  assert.match(explainError({ name: "MongoServerError", message: "bad auth : Authentication failed.", code: 18 }), /Authentication/);
  assert.match(explainError({ name: "MongooseServerSelectionError", message: "Server selection timed out" }), /Network Access/);
  assert.match(explainError({ name: "Error", message: "querySrv ENOTFOUND _mongodb._tcp.x" }), /DNS/);
});

test("app boots with no DB and health reports degraded (503)", async () => {
  const { createApp } = require("../app");
  const app = createApp({ corsOrigins: ["http://localhost:5173"] });
  const server = app.listen(0);
  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.strictEqual(res.status, 503);
  assert.deepStrictEqual(await res.json(), { status: "degraded", db: "disconnected" });
  const nf = await fetch(`http://127.0.0.1:${port}/nope`);
  assert.strictEqual(nf.status, 404);
  server.close();
});

test("unreachable DB fails fast with hint and exit code 1", () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, "..", "app.js")], {
    env: { PATH: process.env.PATH, JWT_SECRET: "x".repeat(40), MONGODB_URI: "mongodb://127.0.0.1:1/x", DB_CONNECT_RETRIES: "1", DB_SERVER_SELECTION_TIMEOUT_MS: "1500" },
    encoding: "utf8", timeout: 20000,
  });
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /Hint:/);
  assert.match(r.stderr, /Backend startup failed/);
});
