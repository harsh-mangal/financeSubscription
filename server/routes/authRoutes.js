// routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/user.js";

const router = express.Router();

async function uniqueReferralCode() {
  // ensure uniqueness
  let code;
  // avoid infinite loop in pathological cases
  for (let i = 0; i < 10; i++) {
    code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const exists = await User.findOne({ referralCode: code });
    if (!exists) return code;
  }
  // fallback (very unlikely to reach)
  return Date.now().toString(36).toUpperCase();
}

// Register (supports referral via `ref` field)
router.post("/register", async (req, res) => {
  try {
    const {
      name = "",
      email,
      password,
      phone,
      gender,
      profession,
      isAdmin,
      ref,
    } = req.body;

    if (!email || !password || !phone) {
      return res
        .status(400)
        .json({ error: "Email, phone, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // resolve referrer by referralCode (ignore if invalid or self)
    let referredBy = null;
    if (ref) {
      const referrer = await User.findOne({
        referralCode: String(ref).trim().toUpperCase(),
      });
      if (referrer) referredBy = referrer._id;
    }

    const code = await uniqueReferralCode();

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone,
      gender,
      profession,
      isAdmin: !!isAdmin,
      referredBy,
      referralCode: code,
    });

    await user.save();

    // increment referrer.referredCount (best-effort)
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, {
        $inc: { "referral.referredCount": 1 },
      }).catch(() => {});
    }

    res.json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        referredBy,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (unchanged)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
