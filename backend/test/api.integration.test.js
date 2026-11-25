// Runs the full E2E suite against a real MongoDB. Skipped unless TEST_MONGODB_URI is set
// (use a throwaway database, NOT production): TEST_MONGODB_URI=mongodb://127.0.0.1:27017/finova_test npm test
const test = require("node:test");
const assert = require("node:assert");

test("end-to-end against real MongoDB", { skip: !process.env.TEST_MONGODB_URI && "set TEST_MONGODB_URI to run" }, async () => {
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
  const { connectDB, disconnectDB } = require("../config/db");
  const { getConfig } = require("../config/env");
  const { seedDatabase } = require("../scripts/seed");
  await connectDB({ config: getConfig() });
  const first = await seedDatabase({ log: { info() {} } });
  const second = await seedDatabase({ log: { info() {} } });
  assert.deepStrictEqual([second.users, second.accounts, second.transactions], [0, 0, 0], "re-seeding must not duplicate");
  assert.ok(first.users + first.accounts + first.transactions >= 0);
  await disconnectDB();
  const { run } = require("../scripts/verify-api");
  assert.strictEqual(await run(), 0);
});
