
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
      mobile: mobile || null,
    });

    const token = generateToken(user);

    return res.status(201).json({
      ok: true,
      message: "Registration successful.",
      token,
      user: safeUser(user),
    });

  } catch (error) {
    console.error("Registration error:", error);

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
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed.",
      code: "server_error",
    });
  }
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
  login,
  register,
  sendOtp,
  verifyOtp,
  resetPassword,
};
