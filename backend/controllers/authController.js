
"use strict";

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate signed JWT
function generateToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || "customer",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
}

// Remove sensitive information
function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
}

// REGISTER
async function register(req, res) {
  try {
    const { name, email, password, mobile } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
        code: "validation",
      });
    }

    if (typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string") {
      return res.status(400).json({
        message: "Invalid input format.",
        code: "validation",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message: "Password must contain 8 to 128 characters.",
        code: "validation",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || name.trim().length < 2 || name.trim().length > 60) {
      return res.status(400).json({
        message: "Enter a valid name (2-60 characters) and email address.",
        code: "validation",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email.",
        code: "duplicate",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      mobile: typeof mobile === "string" && mobile.trim() ? mobile.trim().slice(0, 20) : null,
    });

    const token = generateToken(user);

    return res.status(201).json({
      ok: true,
      message: "Registration successful.",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error("Registration error:", error && error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered.",
        code: "duplicate",
      });
    }

    return res.status(500).json({
      message: "Registration failed.",
      code: "server_error",
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password ||
      typeof email !== "string" ||
      typeof password !== "string") {
      return res.status(400).json({
        message: "Email and password are required.",
        code: "validation",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
        code: "unauthorized",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        message: "Your account is blocked.",
        code: "account_blocked",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
        code: "unauthorized",
      });
    }

    const token = generateToken(user);

    return res.json({
      ok: true,
      message: "Login successful.",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error("Login error:", error && error.message);

    return res.status(500).json({
      message: "Login failed.",
      code: "server_error",
    });
  }
}

// CURRENT USER (identity comes from the verified token)
async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Invalid or expired token.", code: "unauthorized" });
  return res.json({ ok: true, user: safeUser(user) });
}

// OTP SEND - Not configured yet
async function sendOtp(req, res) {
  return res.status(501).json({
    message: "OTP service is not configured yet.",
    code: "not_configured",
  });
}

// OTP VERIFY - Not configured yet
async function verifyOtp(req, res) {
  return res.status(501).json({
    message: "OTP verification service is not configured yet.",
    code: "not_configured",
  });
}

// PASSWORD RESET - Not configured yet
async function resetPassword(req, res) {
  return res.status(501).json({
    message: "Secure password reset service is not configured yet.",
    code: "not_configured",
  });
}

module.exports = {
  me,
  login,
  register,
  sendOtp,
  verifyOtp,
  resetPassword,
};
