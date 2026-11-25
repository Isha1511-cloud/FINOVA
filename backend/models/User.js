
"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    mobile: {
      type: String,
      trim: true,
      default: null,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    // True only for the fictional user created by scripts/seed.js.
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User || mongoose.model("User", userSchema);
