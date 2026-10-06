import type { NotificationType, Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.client.js";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  metadata?: Prisma.InputJsonValue
) {
  return prisma.notification.create({
    data: { userId, type, title, message, metadata },
  });
}
