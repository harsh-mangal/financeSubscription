import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../model/user.js";
import { Transaction } from "../model/transection.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * ✅ Admin Login (only if isAdmin: true)
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await User.findOne({ email: email.toLowerCase(), isAdmin: true });
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

/**
 * ✅ Get all clients
 */
router.get("/clients", requireAdmin, async (req, res) => {
    try {
        const clients = await User.find({ isAdmin: false })
            .select("-password")
            .sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ Update client status (active / inactive)
 */
router.put("/client/:id/status", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // true or false
        const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ message: "Status updated", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * ✅ Admin adds money to client
 */
router.post("/client/:id/add", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const amount = Number(req.body.amount);
        const note = req.body.note || "";

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        // Find the client by ID
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update balance
        user.balance = Number(user.balance) + amount;
        await user.save();

        // Record transaction
        const transaction = await Transaction.create({
            userId: user._id,
            type: "deposit",
            amount,
            meta: { byAdmin: true, note },
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


/**
 * ✅ Admin withdraws money from client
 */
router.post("/client/:id/withdraw", requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const amount = Number(req.body.amount);
        const note = req.body.note || "";

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        // Find user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check balance
        if (user.balance < amount) {
            return res.status(400).json({ error: "Insufficient balance" });
        }

        // Deduct amount
        user.balance = Number(user.balance) - amount;
        await user.save();

        // Record transaction
        const transaction = await Transaction.create({
            userId: user._id,
            type: "withdraw",
            amount,
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


/**
 * ✅ Get admin statistics
 */
router.get("/stats", requireAdmin, async (req, res) => {
    try {
        // 🧾 Date range: last 7 days
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 6); // last 7 days including today

        // 📈 Aggregate deposits by day
        const depositsByDay = await Transaction.aggregate([
            { $match: { type: "deposit", createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 📉 Aggregate withdrawals by day
        const withdrawsByDay = await Transaction.aggregate([
            { $match: { type: "withdraw", createdAt: { $gte: weekAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$amount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // 🧮 Totals for all time
        const depositsAgg = await Transaction.aggregate([
            { $match: { type: "deposit" } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]);

        const withdrawAgg = await Transaction.aggregate([
            { $match: { type: "withdraw" } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
        ]);

        const totalBalanceAgg = await User.aggregate([
            { $group: { _id: null, totalBalance: { $sum: "$balance" }, count: { $sum: 1 } } },
        ]);

        const totalclient = await User.countDocuments({ isAdmin: { $ne: true } });
        const activeClients = await User.countDocuments({
            status: true,
            isAdmin: { $ne: true },
        });

        // 🧠 Merge deposits + withdrawals into chartData for frontend
        const chartDataMap = {};

        // initialize past 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split("T")[0];
            chartDataMap[key] = {
                date: key,
                deposits: 0,
                withdrawals: 0,
            };
        }

        // Fill deposit totals
        depositsByDay.forEach((d) => {
            if (chartDataMap[d._id]) chartDataMap[d._id].deposits = d.total;
        });

        // Fill withdraw totals
        withdrawsByDay.forEach((d) => {
            if (chartDataMap[d._id]) chartDataMap[d._id].withdrawals = d.total;
        });

        const chartData = Object.values(chartDataMap);

        // ✅ Send everything
        res.json({
            totalDeposits: depositsAgg[0]?.total || 0,
            totalWithdraws: withdrawAgg[0]?.total || 0,
            depositCount: depositsAgg[0]?.count || 0,
            withdrawCount: withdrawAgg[0]?.count || 0,
            totalBalance: totalBalanceAgg[0]?.totalBalance || 0,
            clientCount: totalBalanceAgg[0]?.count || 0,
            totalclient,
            activeClients,
            chartData, // <-- frontend can use this directly
        });
    } catch (err) {
        console.error("❌ Error in /admin/stats:", err);
        res.status(500).json({ error: err.message });
    }
});


router.get("/transactions", requireAdmin, async (req, res) => {
    try {
        const { type, limit = 50 } = req.query;

        // Build filter
        const filter = {};
        if (type) filter.type = type;

        // Fetch transactions with user info
        const transactions = await Transaction.find(filter)
            .populate("userId", "name email") // include basic user info
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get("/transactionsById", requireAdmin, async (req, res) => {
    try {
        const { userId } = req.query;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
