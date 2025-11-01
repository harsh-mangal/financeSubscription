// src/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  status: { type: Boolean, default: true },
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
