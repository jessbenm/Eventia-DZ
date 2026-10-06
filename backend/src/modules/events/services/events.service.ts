import { z } from "zod";
import type { EventStatus, Prisma } from "@prisma/client";
import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";
import type { createEventSchema } from "../validators/events.validator.js";

import { createNotification } from "../../../utils/notification.util.js";
import { sendEventCreatedEmail } from "../../../utils/email.util.js";

type CreateEventInput = z.infer<typeof createEventSchema>;

function formatEvent(event: {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime: string | null;
  duration: string;
  location: string;
  city: string;
  capacity: number;
  remainingSeats: number;
  price: Prisma.Decimal | number;
  category: string;
  mainImage: string;
  gallery: string[];
  status: EventStatus;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewsCount: number;
  program: Prisma.JsonValue;
  collaborators: Prisma.JsonValue;
  sponsors: Prisma.JsonValue;
  createdAt: Date;
}) {
  const now = new Date();
  const eventEnd = new Date(event.date);
  const isCompleted = event.status === "COMPLETED" || (eventEnd < now && event.status === "PUBLISHED");
  const startsIn = Math.max(0, event.date.getTime() - now.getTime());

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    date: event.date.toISOString().split("T")[0],
    time: event.time,
    endTime: event.endTime || "",
    duration: event.duration,
    location: event.location,
    city: event.city,
    price: Number(event.price),
    totalSeats: event.capacity,
    availableSeats: event.remainingSeats,
    capacity: event.capacity,
    remainingSeats: event.remainingSeats,
    category: event.category,
    image: event.mainImage,
    coverImage: event.mainImage,
    mainImage: event.mainImage,
    gallery: event.gallery,
    status: isCompleted ? "COMPLETED" : event.status,
    tags: event.tags,
    featured: event.featured,
    rating: event.rating,
    reviews: event.reviewsCount,
    reviewsCount: event.reviewsCount,
    program: event.program || [],
    collaborators: event.collaborators || [],
    sponsors: event.sponsors || [],
    startsIn,
    isCompleted,
    createdAt: event.createdAt.toISOString(),
  };
}

export async function listEvents(query: {
  search?: string;
  city?: string;
  priceMax?: number;
  sortBy?: string;
  status?: string;
  admin?: boolean;
}) {
  const where: Prisma.EventWhereInput = {};

  if (!query.admin) {
    where.status = "PUBLISHED";
    where.date = { gte: new Date(new Date().setHours(0, 0, 0, 0)) };
  } else if (query.status) {
    where.status = query.status as EventStatus;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.city && query.city !== "Toutes les villes") {
    where.city = query.city;
  }

  if (query.priceMax !== undefined) {
    where.price = { lte: query.priceMax };
  }

  let orderBy: Prisma.EventOrderByWithRelationInput = { date: "asc" };
  if (query.sortBy === "price-asc") orderBy = { price: "asc" };
  else if (query.sortBy === "price-desc") orderBy = { price: "desc" };
  else if (query.sortBy === "rating") orderBy = { rating: "desc" };

  const events = await prisma.event.findMany({ where, orderBy });
  return events.map(formatEvent);
}

export async function getEventById(id: string, admin = false) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Événement introuvable");
  if (!admin && event.status !== "PUBLISHED") throw new AppError(404, "Événement introuvable");
  return formatEvent(event);
}

export async function createEvent(organizerId: string, data: CreateEventInput) {
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      date: new Date(data.date),
      time: data.time,
      endTime: data.endTime,
      duration: data.duration,
      location: data.location,
      city: data.city,
      capacity: data.capacity,
      price: data.price,
      category: data.category,
      mainImage: data.mainImage,
      gallery: data.gallery,
      tags: data.tags,
      featured: data.featured,
      program: data.program,
      collaborators: data.collaborators,
      sponsors: data.sponsors,
      remainingSeats: data.capacity,
      organizerId,
      status: "DRAFT",
    },
  });

  const organizer = await prisma.user.findUnique({ where: { id: organizerId } });
  if (organizer) {
    await createNotification(organizerId, "EVENT_CREATED", "Événement créé", `« ${event.title} » a été ajouté.`);
    sendEventCreatedEmail(organizer.email, organizer.firstName, event.title).catch(console.error);
  }

  return formatEvent(event);
}

export async function updateEvent(id: string, data: Partial<CreateEventInput>) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, "Événement introuvable");

  const updateData: Prisma.EventUpdateInput = { ...data };
  if (data.date) updateData.date = new Date(data.date);
  if (data.capacity !== undefined) {
    const sold = existing.capacity - existing.remainingSeats;
    updateData.remainingSeats = Math.max(0, data.capacity - sold);
  }

  const event = await prisma.event.update({ where: { id }, data: updateData });
  return formatEvent(event);
}

export async function deleteEvent(id: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new AppError(404, "Événement introuvable");
  await prisma.event.delete({ where: { id } });
}

export async function publishEvent(id: string) {
  const event = await prisma.event.update({ where: { id }, data: { status: "PUBLISHED" } });
  return formatEvent(event);
}

export async function disableEvent(id: string) {
  const event = await prisma.event.update({ where: { id }, data: { status: "DISABLED" } });
  return formatEvent(event);
}

export async function markCompletedEvents() {
  const now = new Date();
  await prisma.event.updateMany({
    where: { status: "PUBLISHED", date: { lt: now } },
    data: { status: "COMPLETED" },
  });
}
