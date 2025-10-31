import mongoose from "mongoose";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import Subscription from "../models/Subscription.js";
import { appendTxn } from "./wallet.controller.js";

export async function listUsers(req, res) {
  const search = req.query.search || "";
  const q = search
    ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }, { phone: new RegExp(search, "i") }] }
    : {};
  const users = await User.find(q).sort({ createdAt: -1 }).limit(50).select("-passwordHash");
  res.json({ items: users });
}

export async function listTransactions(req, res) {
  const { type, limit = 50 } = req.query;
  const q = type ? { type } : {};
  const items = await Transaction.find(q).sort({ createdAt: -1 }).limit(Number(limit));
  res.json({ items });
}

export async function listWithdrawRequests(req, res) {
  const { status } = req.query;
  const q = status ? { status } : {};
  const items = await WithdrawRequest.find(q).sort({ createdAt: -1 }).populate("userId", "name email phone");
  res.json({ items });
}

export async function approveWithdraw(req, res) {
  const { id } = req.params;
  const wr = await WithdrawRequest.findById(id);
  if (!wr || wr.status !== "PENDING") return res.status(400).json({ error: "Invalid request" });
  wr.status = "APPROVED";
  await wr.save();
  res.json({ request: wr });
}

export async function rejectWithdraw(req, res) {
  const { id } = req.params;
  const wr = await WithdrawRequest.findById(id);
  if (!wr || wr.status === "PAID") return res.status(400).json({ error: "Invalid request" });
  wr.status = "REJECTED";
  await wr.save();
  res.json({ request: wr });
}

export async function markPaidWithdraw(req, res) {
  const { id } = req.params;
  const { payoutRef } = req.body;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const wr = await WithdrawRequest.findById(id).session(session);
      if (!wr || wr.status !== "APPROVED") throw new Error("Invalid request state");
      // Deduct wallet now
      await appendTxn({
        userId: wr.userId,
        type: "WITHDRAW_PAYOUT",
        amount: wr.amount,
        note: `Withdraw paid (${payoutRef})`,
        refs: {},
        session
      });
      wr.status = "PAID";
      wr.payoutRef = payoutRef;
      await wr.save({ session });
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message || "Failed to mark paid" });
  } finally {
    await session.endSession();
  }
}

export async function manualCredit(req, res) {
  const { userId, amount, note } = req.body;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await appendTxn({ userId, type: "CREDIT", amount, note: note || "Manual credit", refs: {}, session });
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  } finally {
    await session.endSession();
  }
}

export async function manualDebit(req, res) {
  const { userId, amount, note } = req.body;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await appendTxn({ userId, type: "DEBIT", amount, note: note || "Manual debit", refs: {}, session });
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  } finally {
    await session.endSession();
  }
}

export async function stats(req, res) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [deposits, payouts, activeSubs] = await Promise.all([
    Transaction.aggregate([
      { $match: { type: { $in: ["CREDIT","REFUND"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Transaction.aggregate([
      { $match: { type: { $in: ["WITHDRAW_PAYOUT","FEE"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Subscription.countDocuments({ status: "ACTIVE", endDate: { $gte: new Date() } })
  ]);
  const todayFlowAgg = await Transaction.aggregate([
    { $match: { createdAt: { $gte: today } } },
    { $group: {
      _id: "$type",
      total: { $sum: "$amount" }
    } }
  ]);
  res.json({
    totalDeposits: deposits[0]?.total || 0,
    totalPayouts: payouts[0]?.total || 0,
    activeSubscriptions: activeSubs,
    todayFlowByType: todayFlowAgg
  });
}
