import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";

export async function getMyNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    unread,
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  const notif = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!notif) throw new AppError(404, "Notification introuvable");
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
