import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signJwt } from "../lib/jwt.js";

export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) return res.status(400).json({ error: "User already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, passwordHash });
  const token = signJwt({ id: user._id, role: user.role, name: user.name });
  res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });
  const token = signJwt({ id: user._id, role: user.role, name: user.name });
  res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone } });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).select("-passwordHash");
  res.json({ user });
}
