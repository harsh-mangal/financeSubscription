// model/transection.js
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdraw", "commission"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },

    // Optional metadata
    note: { type: String, default: "" },
    relatedTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    // when type === "commission"
    sourceUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who triggered it (the referred user)
    commissionKind: { type: String, enum: ["signup", "tx"], default: undefined },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
