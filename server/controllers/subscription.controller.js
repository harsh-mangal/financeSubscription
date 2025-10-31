import mongoose from "mongoose";
import User from "../models/User.js";
import Plan from "../models/Plan.js";
import Subscription from "../models/Subscription.js";
import Transaction from "../models/Transaction.js";
import { appendTxn } from "./wallet.controller.js";

export async function mySubscriptions(req, res) {
  const subs = await Subscription.find({ userId: req.user.id }).sort({ createdAt: -1 }).populate("planId");
  res.json({ items: subs });
}

export async function startSubscription(req, res) {
  const { planId, useWallet, autoRenew } = req.body;
  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) return res.status(400).json({ error: "Invalid or inactive plan" });

  const session = await mongoose.startSession();
  try {
    let sub;
    await session.withTransaction(async () => {
      // charge wallet if useWallet
      if (useWallet) {
        const last = await Transaction.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).session(session);
        const bal = last?.balanceAfter ?? 0;
        if (bal < plan.price) throw new Error("Insufficient wallet balance");
        await appendTxn({
          userId: req.user.id, type: "DEBIT", amount: plan.price, note: `Plan purchase: ${plan.name}`, refs: {}, session
        });
      }

      const now = new Date();
      const end = new Date(now.getTime() + plan.durationDays * 24*60*60*1000);
      const [created] = await Subscription.create([{
        userId: req.user.id,
        planId: plan._id,
        startDate: now,
        endDate: end,
        status: "ACTIVE",
        autoRenew: !!autoRenew,
        amountPaid: plan.price
      }], { session });

      sub = created;

      await User.findByIdAndUpdate(req.user.id, {
        currentPlanId: plan._id,
        subscriptionId: created._id
      }, { session });
    });

    res.json({ subscription: sub });
  } catch (e) {
    if (e.message === "Insufficient wallet balance") return res.status(400).json({ error: e.message });
    console.error(e);
    res.status(500).json({ error: "Failed to start subscription" });
  } finally {
    await session.endSession();
  }
}

export async function cancelSubscription(req, res) {
  const { id } = req.params;
  const sub = await Subscription.findOne({ _id: id, userId: req.user.id });
  if (!sub) return res.status(404).json({ error: "Not found" });
  if (sub.status !== "ACTIVE") return res.status(400).json({ error: "Subscription not active" });

  sub.status = "CANCELLED";
  await sub.save();

  // If you want to immediately remove current plan:
  const user = await User.findById(req.user.id);
  if (user?.subscriptionId?.toString() === id) {
    await User.findByIdAndUpdate(req.user.id, { subscriptionId: null });
  }

  res.json({ subscription: sub });
}
