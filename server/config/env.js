import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT || 3040),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  RZP_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RZP_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || null
};
