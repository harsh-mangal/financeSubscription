import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  approveWithdraw, rejectWithdraw, markPaidWithdraw,
  manualCredit, manualDebit, listUsers, listTransactions,
  listWithdrawRequests, stats
} from "../controllers/admin.controller.js";
import {
  approveWithdraw as idParam, rejectWithdraw as idParam2, markPaidWithdraw as markPaid,
  manualCredit as mcredit, manualDebit as mdebit
} from "../schemas/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const r = Router();
r.use(requireAuth, requireRole("ADMIN"));

r.get("/users", asyncHandler(listUsers));
r.get("/transactions", asyncHandler(listTransactions));
r.get("/withdraw-requests", asyncHandler(listWithdrawRequests));
r.get("/stats", asyncHandler(stats));

r.post("/withdraw-requests/:id/approve", validate(idParam), asyncHandler(approveWithdraw));
r.post("/withdraw-requests/:id/reject", validate(idParam2), asyncHandler(rejectWithdraw));
r.post("/withdraw-requests/:id/mark-paid", validate(markPaid), asyncHandler(markPaidWithdraw));

r.post("/manual-credit", validate(mcredit), asyncHandler(manualCredit));
r.post("/manual-debit", validate(mdebit), asyncHandler(manualDebit));

export default r;
