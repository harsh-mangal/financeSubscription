import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ["ACTIVE","EXPIRED","CANCELLED"], default: "ACTIVE" },
  autoRenew: { type: Boolean, default: false },
  orderId: { type: String },
  amountPaid: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);
