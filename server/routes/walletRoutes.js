// src/routes/wallet.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../model/user.js";
import { Transaction } from "../model/transection.js";

const router = express.Router();

// Add money (deposit)
router.post("/add", requireAuth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance = Number(user.balance) + amount;
    await user.save();

    const tx = await Transaction.create({ userId: user._id, type: "deposit", amount });
    res.json({ message: "Amount added", balance: user.balance, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Withdraw money
router.post("/withdraw", requireAuth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });

    user.balance = Number(user.balance) - amount;
    await user.save();

    const tx = await Transaction.create({ userId: user._id, type: "withdraw", amount });
    res.json({ message: "Withdraw successful", balance: user.balance, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get transactions (latest first)
router.get("/transactions", requireAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get balance
router.get("/balance", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ balance: user.balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get profile (no password)
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
