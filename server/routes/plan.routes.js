import { Router } from "express";
import { listPlans, createPlan, updatePlan, deletePlan } from "../controllers/plan.controller.js";
import { validate } from "../middleware/validate.js";
import { planCreate, planUpdate, idParam } from "../schemas/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const r = Router();
r.get("/", asyncHandler(listPlans));
r.post("/", requireAuth, requireRole("ADMIN"), validate(planCreate), asyncHandler(createPlan));
r.patch("/:id", requireAuth, requireRole("ADMIN"), validate(planUpdate), asyncHandler(updatePlan));
r.delete("/:id", requireAuth, requireRole("ADMIN"), validate(idParam), asyncHandler(deletePlan));
export default r;
