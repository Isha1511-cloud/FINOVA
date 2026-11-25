"use strict";
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { requireAuth, rateLimit } = require("../middleware/auth");

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

router.post("/login", authLimiter, authController.login);
router.post("/register", authLimiter, authController.register);
router.get("/me", requireAuth, authController.me);
router.post("/otp/send", authController.sendOtp);
router.post("/otp/verify", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
