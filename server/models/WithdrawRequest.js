import mongoose from "mongoose";

const withdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
  amount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ["PENDING","APPROVED","REJECTED","PAID"], default: "PENDING" },
  method: { type: String, enum: ["UPI","BANK"], default: "UPI" },
  payoutRef: { type: String },
  adminNote: { type: String }
}, { timestamps: true });

export default mongoose.model("WithdrawRequest", withdrawSchema);
