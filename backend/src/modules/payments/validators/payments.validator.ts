import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  bookingId: z.string().min(1),
});

export const confirmPaymentSchema = z.object({
  bookingId: z.string().min(1),
  paymentIntentId: z.string().optional(),
});
