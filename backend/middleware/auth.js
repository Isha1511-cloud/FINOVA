"use strict";
// Authentication. Identity is derived ONLY from a verified JWT; any userId in a request body,
// query string or URL is ignored for authorization.
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const logger = require("../utils/logger");
const { isObjectIdString } = require("../utils/http");

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Authentication required.", code: "unauthorized" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error("JWT_SECRET is not configured; rejecting authenticated request.");
      return res.status(500).json({ message: "Server authentication is not configured.", code: "server_error" });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch {
      return res.status(401).json({ message: "Invalid or expired token.", code: "unauthorized" });
    }
    if (!payload || !isObjectIdString(String(payload.id))) {
      return res.status(401).json({ message: "Invalid or expired token.", code: "unauthorized" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database unavailable. Please try again shortly.", code: "db_unavailable" });
    }

    // Re-check the user on every request so deleted / blocked users lose access immediately.
    const user = await User.findById(payload.id).select("email role status").lean();
    if (!user) return res.status(401).json({ message: "Invalid or expired token.", code: "unauthorized" });
    if (user.status === "blocked") return res.status(403).json({ message: "Your account is blocked.", code: "account_blocked" });

    req.user = { id: String(user._id), email: user.email, role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

// Small fixed-window limiter (no extra dependency) for login/register brute-force protection.
function rateLimit({ windowMs = 15 * 60 * 1000, max = 20 } = {}) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    let h = hits.get(key);
    if (!h || h.reset <= now) h = { count: 0, reset: now + windowMs };
    h.count += 1;
    hits.set(key, h);
    if (h.count > max) {
      res.set("Retry-After", String(Math.ceil((h.reset - now) / 1000)));
      return res.status(429).json({ message: "Too many attempts. Please try again later.", code: "rate_limited" });
    }
    return next();
  };
}

module.exports = { requireAuth, rateLimit };
