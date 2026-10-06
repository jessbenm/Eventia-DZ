import type { Request, Response, NextFunction } from "express";
import * as paymentsService from "../services/payments.service.js";

export async function createIntent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.createPaymentIntent(req.user!.userId, req.body.bookingId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirm(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentsService.confirmPayment(
      req.user!.userId,
      req.body.bookingId,
      req.body.paymentIntentId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function myPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await paymentsService.getMyPayments(req.user!.userId);
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const payments = await paymentsService.getAllPayments();
    res.json({ success: true, data: payments });
  } catch (err) {
    next(err);
  }
}

export async function webhook(req: Request, res: Response, next: NextFunction) {
  try {
    const signature = req.headers["stripe-signature"] as string;
    await paymentsService.handleStripeWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
}
