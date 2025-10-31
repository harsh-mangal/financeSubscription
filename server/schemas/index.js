import { z } from "zod";

/** Common */
export const idParam = z.object({ params: z.object({ id: z.string().min(1) }), body: z.any(), query: z.any() });

/** Auth */
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    password: z.string().min(6)
  }),
  params: z.any(),
  query: z.any()
});
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  params: z.any(),
  query: z.any()
});

/** Plans */
export const planCreate = z.object({
  body: z.object({
    name: z.string().min(2),
    price: z.number().int().nonnegative(),
    currency: z.string().default("INR"),
    durationDays: z.number().int().positive(),
    features: z.array(z.string()).default([]),
    isActive: z.boolean().optional()
  }),
  params: z.any(),
  query: z.any()
});
export const planUpdate = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().int().nonnegative().optional(),
    currency: z.string().optional(),
    durationDays: z.number().int().positive().optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({ id: z.string().min(1) }),
  query: z.any()
});

/** Subscription */
export const startSub = z.object({
  body: z.object({
    planId: z.string().min(1),
    useWallet: z.boolean().default(true),
    autoRenew: z.boolean().default(false)
  }),
  params: z.any(),
  query: z.any()
});

/** Wallet */
export const createOrder = z.object({
  body: z.object({
    amount: z.number().int().positive(), // paise
    note: z.string().max(120).optional()
  }),
  params: z.any(),
  query: z.any()
});
export const withdrawReq = z.object({
  body: z.object({
    amount: z.number().int().positive(),
    method: z.enum(["UPI","BANK"]).default("UPI")
  }),
  params: z.any(),
  query: z.any()
});

/** Admin */
export const approveWithdraw = idParam;
export const rejectWithdraw = idParam;
export const markPaidWithdraw = z.object({
  body: z.object({ payoutRef: z.string().min(1) }),
  params: z.object({ id: z.string().min(1) }),
  query: z.any()
});
export const manualCredit = z.object({
  body: z.object({ userId: z.string().min(1), amount: z.number().int().positive(), note: z.string().optional() }),
  params: z.any(),
  query: z.any()
});
export const manualDebit = manualCredit;
