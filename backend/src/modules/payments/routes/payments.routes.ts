import { Router } from "express";
import express from "express";
import * as paymentsController from "../controllers/payments.controller.js";
import { validate } from "../../../middlewares/validate.middleware.js";
import { authenticate, requireRole } from "../../../middlewares/auth.middleware.js";
import { createPaymentIntentSchema, confirmPaymentSchema } from "../validators/payments.validator.js";

const router = Router();

router.post("/create-intent", authenticate, validate(createPaymentIntentSchema), paymentsController.createIntent);
router.post("/confirm", authenticate, validate(confirmPaymentSchema), paymentsController.confirm);
router.get("/my", authenticate, paymentsController.myPayments);
router.get("/", authenticate, requireRole("ADMIN"), paymentsController.listAll);

export const webhookRouter = Router();
webhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  paymentsController.webhook
);

export default router;
