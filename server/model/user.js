import mongoose from "mongoose";

function genReferralCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    isAdmin: { type: Boolean, default: false },
    status: { type: Boolean, default: true },

    /** 🧩 New user information fields **/
    phone: {
      type: String,
      required: true,
      match: /^\+?[1-9]\d{6,14}$/, // E.164 international format (e.g., +919876543210)
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    profession: { type: String, default: "" },

    /** 🎁 Referral fields **/
    referralCode: { type: String, unique: true, default: genReferralCode },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referral: {
      firstBonusPaid: { type: Boolean, default: false },
      earnings: { type: Number, default: 0 },
      referredCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
