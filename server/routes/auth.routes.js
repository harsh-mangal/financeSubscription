import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/index.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const r = Router();
r.post("/register", validate(registerSchema), asyncHandler(register));
r.post("/login", validate(loginSchema), asyncHandler(login));
r.get("/me", requireAuth, asyncHandler(me));
export default r;
