import mongoose from "mongoose";

const txnSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  type: { 
    type: String,
    enum: ["CREDIT","DEBIT","WITHDRAW_REQUEST","WITHDRAW_PAYOUT","FEE","REFUND","REVERSAL"],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  balanceAfter: { type: Number, required: true, min: 0 },
  paymentOrderId: { type: String },
  note: { type: String },
  locked: { type: Boolean, default: true },
  adminActorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Transaction", txnSchema);
