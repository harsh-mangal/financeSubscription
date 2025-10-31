import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createOrder, withdrawReq } from "../schemas/index.js";
import {
  getBalance, listTxns, createGatewayOrder, gatewayWebhook, createWithdrawRequest
} from "../controllers/wallet.controller.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const r = Router();
r.get("/balance", requireAuth, asyncHandler(getBalance));
r.get("/transactions", requireAuth, asyncHandler(listTxns));
r.post("/add-money/order", requireAuth, validate(createOrder), asyncHandler(createGatewayOrder));
r.post("/withdraw", requireAuth, validate(withdrawReq), asyncHandler(createWithdrawRequest));

// webhook is public
r.post("/webhook/razorpay", asyncHandler(gatewayWebhook));
export default r;
