import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import { rzp, verifyRazorpaySignature } from "../lib/razorpay.js";
import { env } from "../config/env.js";

export async function getBalance(req, res, next) {
  try {
    const last = await Transaction.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    const amount = last?.balanceAfter ?? 0;
    res.json({ amount });
  } catch (err) {
    console.error("getBalance error:", err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
}


export async function listTxns(req, res) {
  const { limit = 20 } = req.query;
  const items = await Transaction.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  res.json({ items });
}

/** Atomic transaction append */
export async function appendTxn({ userId, type, amount, note, refs = {}, session }) {
  const last = await Transaction.findOne({ userId }).sort({ createdAt: -1 }).session(session);
  const prevBal = last?.balanceAfter ?? 0;
  const delta = ["CREDIT","REFUND"].includes(type) ? +amount : -amount;
  const nextBal = prevBal + delta;
  if (nextBal < 0) throw new Error("Insufficient balance");

  const [doc] = await Transaction.create([{
    userId, type, amount, balanceAfter: nextBal,
    note, paymentOrderId: refs.paymentOrderId, locked: true
  }], { session });
  return doc;
}

/** Create Razorpay order for Add Money */
export async function createGatewayOrder(req, res) {
  const { amount, note } = req.body;
  const order = await rzp.orders.create({
    amount, currency: "INR", notes: { userId: String(req.user.id), note: note || "" }
  });
  res.json({ order });
}

/** Razorpay Webhook (public) */
export async function gatewayWebhook(req, res) {
  try {
    const payload = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"];
    if (env.WEBHOOK_SECRET) {
      const ok = verifyRazorpaySignature({ payload, signature, secret: env.WEBHOOK_SECRET });
      if (!ok) return res.status(400).json({ error: "Invalid signature" });
    }
    const event = req.body?.event;
    if (event !== "payment.captured") return res.json({ ok: true }); // ignore others

    const payment = req.body.payload?.payment?.entity;
    const userId = req.body.payload?.payment?.entity?.notes?.userId;
    if (!payment || !userId) return res.status(400).json({ error: "Missing payment or userId" });

    const amount = Number(payment.amount);
    const orderId = payment.order_id;

    // idempotency: if a CREDIT already exists for this payment/order, skip
    const exists = await Transaction.findOne({ paymentOrderId: orderId, type: "CREDIT" });
    if (exists) return res.json({ ok: true, skipped: true });

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await appendTxn({
          userId, type: "CREDIT", amount,
          note: "Add Money (Razorpay)",
          refs: { paymentOrderId: orderId },
          session
        });
      });
    } finally {
      await session.endSession();
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    res.status(500).json({ error: "Webhook failed" });
  }
}

export async function createWithdrawRequest(req, res) {
  const { amount, method } = req.body;
  const session = await mongoose.startSession();
  let wr;
  try {
    await session.withTransaction(async () => {
      // Do not deduct here; only deduct when PAID (safer). Optionally create a HOLD txn type if you want.
      wr = await WithdrawRequest.create([{ userId: req.user.id, amount, method }], { session });
      // Also create a log txn of request (non-balance affecting) if you want:
      await appendTxn({ userId: req.user.id, type: "WITHDRAW_REQUEST", amount: 0, note: `Requested ${amount}`, refs: {}, session });
    });
  } finally {
    await session.endSession();
  }
  res.json({ request: wr[0] });
}
