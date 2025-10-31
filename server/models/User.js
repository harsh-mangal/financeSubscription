import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  role: { type: String, enum: ["ADMIN","USER"], default: "USER" },
  status: { type: String, enum: ["ACTIVE","BANNED"], default: "ACTIVE" },
  currentPlanId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", default: null },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription", default: null },
  kycStatus: { type: String, enum: ["NOT_SUBMITTED","PENDING","APPROVED","REJECTED"], default: "NOT_SUBMITTED" }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
