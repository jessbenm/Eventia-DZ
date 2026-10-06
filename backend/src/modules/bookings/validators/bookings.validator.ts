import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});
