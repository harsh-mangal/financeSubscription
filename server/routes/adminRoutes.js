import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../model/user.js";
import { Transaction } from "../model/transection.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/* ----------------------------- ADMIN LOGIN ------------------------------ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({
      email: email.toLowerCase(),
      isAdmin: true,
    });
    if (!admin) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -------------------------------- CLIENTS ------------------------------- */
router.get("/clients", requireAdmin, async (req, res) => {
  try {
    const clients = await User.find({ isAdmin: false })
      .select("-password")
      .populate("referredBy", "name email referralCode") // << show who referred
      .sort({ createdAt: -1 });

    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/client/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // true or false
    const user = await User.findByIdAndUpdate(id, { status }, { new: true })
      .select("-password")
      .populate("referredBy", "name email referralCode");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Status updated", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ------------------------ ADMIN CREDIT/DEBIT FUNDS ---------------------- */
router.post("/client/:id/add", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.balance = Number(user.balance) + amount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: "deposit",
      amount,
      note,
      meta: { byAdmin: true, note }, // meta optional
    });

    res.json({
      message: "Amount added successfully by admin",
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/client/:id/withdraw", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body.amount);
    const note = req.body.note || "";
    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.balance < amount)
      return res.status(400).json({ error: "Insufficient balance" });

    user.balance = Number(user.balance) - amount;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: "withdraw",
      amount,
      note,
      meta: { byAdmin: true, note },
    });

    res.json({
      message: "Amount withdrawn successfully by admin",
      balance: user.balance,
      transaction,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------- ADMIN STATISTICS -------------------------- */
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 6);

    // deposits, withdraws, commissions by day (last 7 days)
    const aggByDay = async (type) =>
      Transaction.aggregate([
        { $match: { type, createdAt: { $gte: weekAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

    const depositsByDay = await aggByDay("deposit");
    const withdrawsByDay = await aggByDay("withdraw");
    const commissionsByDay = await aggByDay("commission");

    // all-time totals
    const baseAgg = async (type) =>
      Transaction.aggregate([
        { $match: { type } },
        {
          $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
      ]);

    const depositsAgg = await baseAgg("deposit");
    const withdrawAgg = await baseAgg("withdraw");
    const commissionsAgg = await baseAgg("commission");

    // commission split by kind (signup/tx)
    const commissionKindAgg = await Transaction.aggregate([
      { $match: { type: "commission" } },
      {
        $group: {
          _id: "$commissionKind",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalBalanceAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalclient = await User.countDocuments({ isAdmin: { $ne: true } });
    const activeClients = await User.countDocuments({
      status: true,
      isAdmin: { $ne: true },
    });

    // 7-day chart skeleton
    const chartDataMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      chartDataMap[key] = {
        date: key,
        deposits: 0,
        withdrawals: 0,
        commissions: 0,
      };
    }
    depositsByDay.forEach(
      (d) => chartDataMap[d._id] && (chartDataMap[d._id].deposits = d.total)
    );
    withdrawsByDay.forEach(
      (d) => chartDataMap[d._id] && (chartDataMap[d._id].withdrawals = d.total)
    );
    commissionsByDay.forEach(
      (d) => chartDataMap[d._id] && (chartDataMap[d._id].commissions = d.total)
    );

    // map commission kind totals
    const kindMap = commissionKindAgg.reduce(
      (acc, k) => ((acc[k._id || "unknown"] = k.total || 0), acc),
      { signup: 0, tx: 0 }
    );

    res.json({
      // money totals
      totalDeposits: depositsAgg[0]?.total || 0,
      totalWithdraws: withdrawAgg[0]?.total || 0,
      totalCommissionsPaid: commissionsAgg[0]?.total || 0,
      // counts
      depositCount: depositsAgg[0]?.count || 0,
      withdrawCount: withdrawAgg[0]?.count || 0,
      commissionCount: commissionsAgg[0]?.count || 0,
      // commission split
      commissionSplit: {
        signup: kindMap.signup || 0,
        tx: kindMap.tx || 0,
      },
      // users & balances
      totalBalance: totalBalanceAgg[0]?.totalBalance || 0,
      clientCount: totalBalanceAgg[0]?.count || 0,
      totalclient,
      activeClients,
      // chart
      chartData: Object.values(chartDataMap),
    });
  } catch (err) {
    console.error("❌ Error in /admin/stats:", err);
    res.status(500).json({ error: err.message });
  }
});

/* --------------------------- REFERRAL REPORTING ------------------------- */

/**
 * Top referrers by lifetime earnings (and count of referred users).
 * GET /admin/referrals/top?limit=10
 */
router.get("/referrals/top", requireAdmin, async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    // Sum commissions grouped by referrer (userId is the referrer in commission rows)
    const topEarningRefs = await Transaction.aggregate([
      { $match: { type: "commission" } },
      {
        $group: {
          _id: "$userId",
          totalEarnings: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          referrerId: "$user._id",
          name: "$user.name",
          email: "$user.email",
          referralCode: "$user.referralCode",
          referredCount: "$user.referral.referredCount",
          totalEarnings: 1,
          commissionCount: "$count",
        },
      },
    ]);

    res.json(topEarningRefs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Per-referrer detail:
 * - referrer profile + lifetime earnings
 * - list of referred users
 * - recent commission transactions (with sourceUser populated)
 * GET /admin/referrals/:referrerId
 */
router.get("/referrals/:referrerId", requireAdmin, async (req, res) => {
  try {
    const { referrerId } = req.params;

    const referrer = await User.findById(referrerId).select("-password").lean();
    if (!referrer) return res.status(404).json({ error: "Referrer not found" });

    const referredUsers = await User.find({ referredBy: referrerId })
      .select(
        "name email referral firstBonusPaid referralCode createdAt status"
      )
      .lean();

    const earningsAgg = await Transaction.aggregate([
      {
        $match: {
          type: "commission",
          userId: new mongoose.Types.ObjectId(referrerId),
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    const recentCommissions = await Transaction.find({
      type: "commission",
      userId: referrerId,
    })
      .populate("sourceUserId", "name email referralCode")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      referrer,
      referredUsers,
      lifetimeEarnings: earningsAgg[0]?.total || 0,
      commissionCount: earningsAgg[0]?.count || 0,
      recentCommissions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------- TRANSACTIONS ----------------------------- */
/**
 * GET /admin/transactions?type=deposit|withdraw|commission&limit=50&commissionKind=signup|tx
 * &includeSource=true
 */
router.get("/transactions", requireAdmin, async (req, res) => {
  try {
    const { type, limit = 50, commissionKind, includeSource } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (commissionKind) filter.commissionKind = commissionKind;

    const q = Transaction.find(filter)
      .populate("userId", "name email referralCode") // the owner of the row (for commission: the referrer)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    if (includeSource === "true" || includeSource === true) {
      q.populate("sourceUserId", "name email referralCode"); // who triggered the commission
    }

    const transactions = await q.exec();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/transactionsById", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.query;
    const transactions = await Transaction.find({ userId })
      .populate("sourceUserId", "name email referralCode")
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
