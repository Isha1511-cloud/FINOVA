// Usage: npm run db:check  -> tests the connection and exits 0/1 (no server started).
const logger = require("../utils/logger");
const connectDB = require("../config/db");
const { disconnectDB } = require("../config/db");
(async () => {
  try {
    await connectDB();
    logger.info("DB check passed.");
    await disconnectDB();
    process.exit(0);
  } catch (e) {
    logger.error("DB check failed:", e.message);
    process.exit(1);
  }
})();
