// CHANGED: refactored. Config validation, CORS fix, health reports DB state,
// 404 + error middleware, graceful shutdown, process-level error handlers.
const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const { getConfig } = require("./config/env"); // also loads server/.env
const connectDB = require("./config/db");
const { isDBConnected, disconnectDB } = require("./config/db");

function createApp(config = getConfig()) {
  const app = express();
  app.set("trust proxy", 1); // Render sits behind a proxy; needed for correct client IPs (rate limiting)

  // CHANGED: origin was `process.env.FRONTEND_URL` (could be undefined or a
  // placeholder like "[FRONTEND_ORIGIN]", which breaks CORS). Now a validated allow-list.
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || config.corsOrigins.includes("*") || config.corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
    })
  );
  app.use(express.json());

  // CHANGED: health now reports DB state (503 when DB is down) for deploy probes.
  app.get("/api/health", (req, res) => {
    const db = isDBConnected();
    res.status(db ? 200 : 503).json({ status: db ? "ok" : "degraded", db: db ? "connected" : "disconnected" });
  });

  // Mount feature routers (supporting both /api/* and direct /* prefixes)
  const { depositsRouter, withdrawalsRouter } = require("./routes/cashflow");
  app.use("/api/auth", require("./routes/auth"));
  app.use("/auth", require("./routes/auth"));
  app.use("/api/dashboard", require("./routes/dashboard"));
  app.use("/dashboard", require("./routes/dashboard"));
  app.use("/api/accounts", require("./routes/accounts"));
  app.use("/accounts", require("./routes/accounts"));
  app.use("/api/transactions", require("./routes/transactions"));
  app.use("/transactions", require("./routes/transactions"));
  app.use("/api/deposits", depositsRouter);
  app.use("/deposits", depositsRouter);
  app.use("/api/withdrawals", withdrawalsRouter);
  app.use("/withdrawals", withdrawalsRouter);
  app.use("/api/statements", require("./routes/statements"));
  app.use("/statements", require("./routes/statements"));
  app.use("/api/ai", require("./routes/ai"));
  app.use("/ai", require("./routes/ai"));

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    logger.error("Request error:", err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : "Internal server error" });
  });
  return app;
}

async function startServer() {
  const config = getConfig();
  // Authentication cannot work without a signing secret: fail fast with a clear message (value never logged).
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET is missing or shorter than 32 characters. Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"");
  }
  if (config.frontendUrlWasPlaceholder) logger.warn("FRONTEND_URL is a placeholder; using http://localhost:5173 for CORS.");

  if (config.mongoUri) {
    try {
      await connectDB({ config }); // throws with a clear message on failure
    } catch (err) {
      if (process.env.ALLOW_OFFLINE_FALLBACK === "true" && !config.mongoUri.includes("127.0.0.1:1")) {
        logger.warn(`Database connection failed (${err.message}). Backend continuing in degraded mode.`);
      } else {
        throw err;
      }
    }
  } else {
    logger.warn("MONGODB_URI is not set. Backend starting in offline/degraded mode. (Health check: 503 degraded)");
  }
  const app = createApp(config);
  const server = app.listen(config.port, () => logger.info(`Backend running at http://localhost:${config.port}`));

  server.on("error", (err) => {
    logger.error(err.code === "EADDRINUSE" ? `Port ${config.port} is already in use. Change PORT in .env.` : err.message);
    process.exit(1);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  ["SIGINT", "SIGTERM"].forEach((s) => process.on(s, () => shutdown(s)));
  return server;
}

if (require.main === module) {
  process.on("unhandledRejection", (r) => logger.error("Unhandled rejection:", r && r.message ? r.message : r));
  startServer().catch((error) => {
    logger.error("Backend startup failed:", error.message);
    process.exit(1);
  });
}

module.exports = { createApp, startServer };
