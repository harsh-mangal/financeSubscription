import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env.js";

export const rzp = new Razorpay({
  key_id: env.RZP_KEY_ID,
  key_secret: env.RZP_KEY_SECRET
});

export function verifyRazorpaySignature({ payload, signature, secret }) {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return digest === signature;
}
