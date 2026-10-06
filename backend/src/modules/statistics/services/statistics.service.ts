import { prisma } from "../../../database/prisma.client.js";
import { markCompletedEvents } from "../../events/services/events.service.js";

export async function getOverview() {
  await markCompletedEvents();

  const [
    totalEvents,
    activeEvents,
    completedEvents,
    totalUsers,
    ticketsSold,
    payments,
    allEvents,
  ] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count({ where: { status: "COMPLETED" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.ticket.count({ where: { status: { in: ["VALID", "USED"] } } }),
    prisma.payment.findMany({ where: { status: "SUCCEEDED" } }),
    prisma.event.findMany({ select: { category: true, capacity: true, remainingSeats: true } }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = payments
    .filter((p) => p.createdAt >= monthStart)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const monthlyData = await getMonthlyRevenue();
  const fillRate = getFillRate(allEvents);
  const categoryBreakdown = getCategoryBreakdown(allEvents);

  return {
    totalEvents,
    activeEvents,
    completedEvents,
    totalUsers,
    totalTicketsSold: ticketsSold,
    totalRevenue,
    monthlyRevenue,
    fillRate,
    monthlyRevenueChart: monthlyData,
    categoryBreakdown,
  };
}

export async function getPublicStats() {
  const [totalUsers, totalEvents, ticketsSold, payments, avgRating] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.ticket.count({ where: { status: { in: ["VALID", "USED"] } } }),
    prisma.payment.count({ where: { status: "SUCCEEDED" } }),
    prisma.event.aggregate({ _avg: { rating: true } }),
  ]);

  const satisfaction = Math.round((avgRating._avg.rating || 4.5) * 20);

  return {
    totalUsers,
    totalEvents,
    ticketsSold,
    paymentsCount: payments,
    satisfaction: Math.min(satisfaction, 100),
  };
}

async function getMonthlyRevenue() {
  const payments = await prisma.payment.findMany({
    where: { status: "SUCCEEDED" },
    include: { booking: true },
    orderBy: { createdAt: "asc" },
  });

  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const byMonth: Record<string, { revenue: number; tickets: number }> = {};

  for (const p of payments) {
    const m = months[p.createdAt.getMonth()];
    if (!byMonth[m]) byMonth[m] = { revenue: 0, tickets: 0 };
    byMonth[m].revenue += Number(p.amount);
    byMonth[m].tickets += p.booking?.quantity || 1;
  }

  return Object.entries(byMonth).map(([month, data]) => ({ month, ...data }));
}

function getFillRate(events: { capacity: number; remainingSeats: number }[]) {
  if (events.length === 0) return 0;
  const totalCapacity = events.reduce((s, e) => s + e.capacity, 0);
  const totalSold = events.reduce((s, e) => s + (e.capacity - e.remainingSeats), 0);
  return totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
}

function getCategoryBreakdown(events: { category: string; capacity: number; remainingSeats: number }[]) {
  const byCat: Record<string, number> = {};
  for (const e of events) {
    const sold = e.capacity - e.remainingSeats;
    byCat[e.category] = (byCat[e.category] || 0) + sold;
  }
  const total = Object.values(byCat).reduce((s, v) => s + v, 0);
  if (total === 0) return [{ name: "Aucune vente", value: 100 }];
  return Object.entries(byCat).map(([name, sold]) => ({
    name,
    value: Math.round((sold / total) * 100),
  }));
}

export async function getRevenueStats() {
  const payments = await prisma.payment.findMany({
    where: { status: "SUCCEEDED" },
    orderBy: { createdAt: "desc" },
  });
  return {
    total: payments.reduce((s, p) => s + Number(p.amount), 0),
    count: payments.length,
    payments: payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      date: p.createdAt.toISOString(),
    })),
  };
}
