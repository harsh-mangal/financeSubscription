import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { rateLimit } from "./middleware/rateLimit.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import planRoutes from "./routes/plan.routes.js";
import subRoutes from "./routes/subscription.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
app.use((err, req, res, next) => {
  // Avoid crashing the process for expected async throw
  console.error("💥 Unhandled route error:", err);
  if (res.headersSent) return next(err);
  const msg = err?.message || "Server error";
  const code = err?.statusCode || 500;
  res.status(code).json({ error: msg });
});

// During dev, keep Node from crashing on unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("🧯 UnhandledRejection:", reason);
});
// Security & parsers
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // 👈 important
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// API
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// Boot
connectDB().then(() => {
  app.listen(env.PORT, () =>
    console.log(`🚀 API on http://localhost:${env.PORT}`)
  );
});
