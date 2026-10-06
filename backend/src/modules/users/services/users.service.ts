import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";
import type { Prisma } from "@prisma/client";

export async function updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }) {
  const user = await prisma.user.update({ where: { id: userId }, data });
  const ticketCount = await prisma.booking.aggregate({
    where: { userId, status: "CONFIRMED" },
    _sum: { quantity: true },
  });
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    joinDate: user.createdAt.toISOString(),
    premium: (ticketCount._sum.quantity || 0) >= 3,
  };
}

export async function getAllUsers(query: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const page = query.page || 1;
  const limit = Math.min(query.limit || 10, 50);
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = { role: "USER" };
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: "desc" };
  if (query.sortBy === "name") orderBy = { firstName: query.sortOrder || "asc" };
  else if (query.sortBy === "email") orderBy = { email: query.sortOrder || "asc" };
  else if (query.sortBy === "date") orderBy = { createdAt: query.sortOrder || "desc" };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        bookings: { where: { status: "CONFIRMED" }, include: { payment: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const items = users.map((u) => {
    const tickets = u.bookings.reduce((sum, b) => sum + b.quantity, 0);
    const spent = u.bookings.reduce((sum, b) => sum + Number(b.payment?.amount || b.totalPrice), 0);
    return {
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      avatar: u.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
      role: u.role,
      provider: u.provider,
      tickets,
      spent,
      premium: tickets >= 3,
      joinDate: u.createdAt.toISOString(),
    };
  });

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, "Utilisateur introuvable");
  return user;
}
