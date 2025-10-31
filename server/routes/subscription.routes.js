import { Router } from "express";
import { mySubscriptions, startSubscription, cancelSubscription } from "../controllers/subscription.controller.js";
import { validate } from "../middleware/validate.js";
import { startSub, idParam } from "../schemas/index.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const r = Router();
r.use(requireAuth);
r.get("/my", asyncHandler(mySubscriptions));
r.post("/start", validate(startSub), asyncHandler(startSubscription));
r.patch("/cancel/:id", validate(idParam), asyncHandler(cancelSubscription));
export default r;
