import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string(),
  time: z.string(),
  endTime: z.string().optional(),
  duration: z.string(),
  location: z.string(),
  city: z.string().default("Oran"),
  capacity: z.number().int().positive(),
  price: z.number().positive(),
  category: z.string().default("Événement"),
  mainImage: z.string().url(),
  gallery: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  program: z.any().optional(),
  collaborators: z.any().optional(),
  sponsors: z.any().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const eventQuerySchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  priceMax: z.coerce.number().optional(),
  sortBy: z.enum(["date", "price-asc", "price-desc", "rating"]).optional(),
  status: z.string().optional(),
});
