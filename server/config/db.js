// CHANGED: rewritten. Adds env validation, timeouts, retry with backoff, connection
// event logging, actionable error hints, and a clean disconnect. Credentials are never logged.
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { getConfig, redactUri } = require("./env");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Maps low-level driver errors to a human-readable cause + fix.
function explainError(err) {
  const msg = `${err && err.name} ${err && err.message} ${err && err.code}`;
  if (/AuthenticationFailed|bad auth|authentication failed|code.?18/i.test(msg))
    return "Authentication failed: check the DB username/password. URL-encode special characters in the password (@ -> %40).";
  if (/ENOTFOUND|querySrv|EAI_AGAIN|ECONNREFUSED.*53/i.test(msg))
    return "DNS lookup failed: check the cluster hostname in MONGODB_URI and your internet/DNS/VPN.";
  if (/ReplicaSetNoPrimary|ServerSelection|Server selection timed out|ETIMEDOUT|ECONNREFUSED/i.test(msg))
    return "Cannot reach the database server: in Atlas > Network Access allow your current IP (or 0.0.0.0/0 for testing), and check firewall/VPN. For a local DB, make sure mongod is running.";
  if (/Invalid (scheme|connection string)|MongoParseError|must be escaped|URI/i.test(msg))
    return "Malformed MONGODB_URI: check the format and URL-encode special characters in the password.";
  if (/SSL|TLS|certificate/i.test(msg))
    return "TLS error: check system clock, antivirus/proxy interception, and Node version.";
  return "Unexpected connection error; see the message above.";
}

let listenersAttached = false;
function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  const c = mongoose.connection;
  c.on("connected", () => logger.info(`MongoDB connected (db: "${c.name}", host: ${c.host})`));
  c.on("disconnected", () => logger.warn("MongoDB disconnected"));
  c.on("reconnected", () => logger.info("MongoDB reconnected"));
  c.on("error", (e) => logger.error("MongoDB runtime error:", e.message));
}

/**
 * Connects to MongoDB. Throws after all retries fail (caller decides to exit).
 * @param {object} [overrides] test hooks: { config }
 */
async function connectDB(overrides = {}) {
  const cfg = overrides.config || getConfig();
  if (cfg.errors.length) {
    const e = new Error(cfg.errors.join(" "));
    e.code = "CONFIG_INVALID";
    throw e;
  }
  attachListeners();
  mongoose.set("strictQuery", true);

  const options = {
    serverSelectionTimeoutMS: cfg.serverSelectionTimeoutMS, // fail fast instead of hanging ~30s
    connectTimeoutMS: cfg.serverSelectionTimeoutMS,
    ...(cfg.dbName ? { dbName: cfg.dbName } : {}),
  };

  const attempts = Math.max(1, cfg.retries);
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      logger.info(`Connecting to MongoDB (${redactUri(cfg.mongoUri)}) attempt ${i}/${attempts}`);
      await mongoose.connect(cfg.mongoUri, options);
      return mongoose.connection;
    } catch (err) {
      lastErr = err;
      logger.error(`Attempt ${i} failed: ${err.message}`);
      logger.error(`Hint: ${explainError(err)}`);
      // Credential/URI problems will not fix themselves - do not retry.
      if (/AuthenticationFailed|bad auth|MongoParseError|Invalid (scheme|connection string)/i.test(`${err.name} ${err.message}`)) break;
      if (i < attempts) await sleep(cfg.retryDelayMs * i);
    }
  }
  const e = new Error(`Database connection failed: ${lastErr.message}`);
  e.cause = lastErr;
  throw e;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

const isDBConnected = () => mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.isDBConnected = isDBConnected;
module.exports.explainError = explainError;
