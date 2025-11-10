import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // allow frontend or all
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // safe JSON parsing

// ===== Connect to MongoDB =====
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("💳 Wallet API is running successfully!");
});

// ===== Global Error Handler (Optional but good practice) =====
app.use((err, req, res, next) => {
  console.error("⚠️ Global error:", err.stack || err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
