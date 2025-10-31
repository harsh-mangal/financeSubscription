// src/middleware/auth.js
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // { id, role, name }
    next();
  } catch (err) {
    console.error("JWT verify failed:", err?.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}


export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
