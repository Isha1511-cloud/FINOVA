// Loads and validates environment variables. (CHANGED: new file - centralises checks
// so misconfiguration is reported clearly before any connection attempt.)
const path = require("path");
// Load server/.env regardless of the directory `npm`/`node` is launched from.
if (!process.env.TEST_ISOLATION) require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

// Detects unfilled template values like [CONNECTION_STRING] or <password>.
const isPlaceholder = (v) => /^\s*\[.*\]\s*$/.test(v) || /<[^>]+>/.test(v);

// Hides credentials in a URI so it is safe to log.
function redactUri(uri = "") {
  return String(uri).replace(/\/\/([^@/]*)@/, "//***:***@");
}

function getConfig() {
  const errors = [];
  const uri = (process.env.MONGODB_URI || "").trim().replace(/^['"]|['"]$/g, "");

  if (!uri) errors.push("MONGODB_URI is missing. Add it to server/.env (see .env.example).");
  else if (isPlaceholder(uri)) errors.push("MONGODB_URI still contains a placeholder. Replace [CONNECTION_STRING] / <password> with real values.");
  else if (!/^mongodb(\+srv)?:\/\//.test(uri)) errors.push("MONGODB_URI must start with mongodb:// or mongodb+srv://.");

  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push(`PORT is invalid: "${process.env.PORT}".`);

  // CORS origins: comma-separated list; placeholders/blank fall back to Vite dev origin.
  const raw = (process.env.FRONTEND_URL || "").trim();
  const origins = raw && !isPlaceholder(raw)
    ? raw.split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean)
    : ["http://localhost:5173"];

  const num = (k, d) => (Number.isFinite(Number(process.env[k])) && process.env[k] !== undefined && process.env[k] !== "" ? Number(process.env[k]) : d);
  const dbName = (process.env.MONGODB_DB_NAME || "").trim();

  return {
    errors,
    frontendUrlWasPlaceholder: !!raw && isPlaceholder(raw),
    mongoUri: uri,
    dbName: dbName && !isPlaceholder(dbName) ? dbName : undefined,
    port,
    corsOrigins: origins,
    retries: num("DB_CONNECT_RETRIES", 3),
    retryDelayMs: num("DB_RETRY_DELAY_MS", 2000),
    serverSelectionTimeoutMS: num("DB_SERVER_SELECTION_TIMEOUT_MS", 10000),
  };
}

module.exports = { getConfig, redactUri, isPlaceholder };
