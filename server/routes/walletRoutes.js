// routes/walletRoutes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { User } from "../model/user.js";
import { Transaction } from "../model/transection.js";

const router = express.Router();

/** ===== Referral Config (via .env) =====
 * REF_SIGNUP_BONUS_TYPE=PERCENT|FLAT
 * REF_SIGNUP_BONUS_VALUE=10          // 10% if PERCENT, or 10 currency units if FLAT
 * REF_TXN_FIXED=2                    // flat fixed commission each eligible tx of referred user
 * REF_TXN_ON_TYPES=deposit,withdraw  // which tx types trigger fixed commission
 */
const SIGNUP_TYPE = (process.env.REF_SIGNUP_BONUS_TYPE || "PERCENT").toUpperCase();
const SIGNUP_VALUE = Number(process.env.REF_SIGNUP_BONUS_VALUE || 0);
const TXN_FIXED = Number(process.env.REF_TXN_FIXED || 0);
const TXN_ON_TYPES = String(process.env.REF_TXN_ON_TYPES || "deposit,withdraw")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

async function creditCommission({
  referrerId,
  amount,
  commissionKind, // "signup" | "tx"
  note,
  sourceUserId,
  relatedTransactionId,
}) {
  if (!referrerId || amount <= 0) return null;

  // credit balance
  const ref = await User.findById(referrerId);
  if (!ref) return null;

  ref.balance = round2((ref.balance || 0) + amount);
  ref.referral.earnings = round2((ref.referral?.earnings || 0) + amount);
  await ref.save();

  // log commission transaction
  const commissionTx = await Transaction.create({
    userId: ref._id,
    type: "commission",
    amount: round2(amount),
    note: note || "",
    commissionKind,
    sourceUserId,
    relatedTransactionId,
  });

  return commissionTx;
}

// Add money (deposit)
router.post("/add", requireAuth, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance = round2(Number(user.balance) + amount);
    await user.save();

    const tx = await Transaction.create({ userId: user._id, type: "deposit", amount: round2(amount) });

    // === Referral payouts ===
    if (user.referredBy) {
      // 1) One-time signup bonus based on FIRST deposit (guarded by flag)
      if (!user.referral?.firstBonusPaid && SIGNUP_VALUE > 0) {
        let bonus = 0;
        if (SIGNUP_TYPE === "PERCENT") bonus = round2((amount * SIGNUP_VALUE) / 100);
        else bonus = round2(SIGNUP_VALUE);

        if (bonus > 0) {
          await creditCommission({
            referrerId: user.referredBy,
            amount: bonus,
            commissionKind: "signup",
            note: `Signup bonus from first deposit of referred user ${user.email}`,
            sourceUserId: user._id,
            relatedTransactionId: tx._id,
          });

          await User.findByIdAndUpdate(user._id, { $set: { "referral.firstBonusPaid": true } });
        }
      }

      // 2) Per-transaction fixed commission (if deposits are enabled)
      if (TXN_FIXED > 0 && TXN_ON_TYPES.includes("deposit")) {
        await creditCommission({
          referrerId: user.referredBy,
          amount: round2(TXN_FIXED),
          commissionKind: "tx",
          note: `Fixed commission on deposit by referred user ${user.email}`,
          sourceUserId: user._id,
          relatedTransactionId: tx._id,
        });
      }
    }

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

    user.balance = round2(Number(user.balance) - amount);
    await user.save();

    const tx = await Transaction.create({ userId: user._id, type: "withdraw", amount: round2(amount) });

    // Per-transaction fixed commission (if withdrawals are enabled)
    if (user.referredBy && TXN_FIXED > 0 && TXN_ON_TYPES.includes("withdraw")) {
      await creditCommission({
        referrerId: user.referredBy,
        amount: round2(TXN_FIXED),
        commissionKind: "tx",
        note: `Fixed commission on withdraw by referred user ${user.email}`,
        sourceUserId: user._id,
        relatedTransactionId: tx._id,
      });
    }

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
