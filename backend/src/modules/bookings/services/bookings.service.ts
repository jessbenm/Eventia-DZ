import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";
import { sendCancellationEmail } from "../../../utils/email.util.js";

export async function createBooking(userId: string, eventId: string, quantity: number) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError(404, "Événement introuvable");
  if (event.status !== "PUBLISHED") throw new AppError(400, "Événement non disponible");
  if (event.remainingSeats < quantity) throw new AppError(400, "Places insuffisantes");

  const totalPrice = Number(event.price) * quantity;

  const booking = await prisma.$transaction(async (tx) => {
    const updated = await tx.event.updateMany({
      where: { id: eventId, remainingSeats: { gte: quantity } },
      data: { remainingSeats: { decrement: quantity } },
    });
    if (updated.count === 0) throw new AppError(400, "Places insuffisantes");

    return tx.booking.create({
      data: { userId, eventId, quantity, totalPrice, status: "PENDING" },
      include: { event: true },
    });
  });

  return formatBooking(booking);
}

export async function getMyBookings(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { event: true, tickets: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return bookings.map(formatBooking);
}

export async function cancelBooking(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, user: true },
  });
  if (!booking) throw new AppError(404, "Réservation introuvable");
  if (booking.userId !== userId) throw new AppError(403, "Accès refusé");
  if (booking.status === "CANCELLED") throw new AppError(400, "Déjà annulée");
  if (booking.status === "CONFIRMED") throw new AppError(400, "Impossible d'annuler une réservation confirmée");

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
    await tx.event.update({
      where: { id: booking.eventId },
      data: { remainingSeats: { increment: booking.quantity } },
    });
  });

  sendCancellationEmail(booking.user.email, booking.user.firstName, booking.event.title).catch(console.error);
  return { message: "Réservation annulée" };
}

export async function getAllBookings() {
  const bookings = await prisma.booking.findMany({
    include: { event: true, user: true, tickets: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
  return bookings.map(formatBooking);
}

function formatBooking(booking: {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalPrice: { toString(): string } | number;
  status: string;
  createdAt: Date;
  event?: { title: string; date: Date; location: string; mainImage: string };
  tickets?: { id: string; qrCode: string; status: string }[];
  payment?: { status: string; amount: { toString(): string } | number } | null;
  user?: { firstName: string; lastName: string; email: string };
}) {
  return {
    id: booking.id,
    userId: booking.userId,
    eventId: booking.eventId,
    eventTitle: booking.event?.title || "",
    date: booking.event?.date.toISOString().split("T")[0] || "",
    location: booking.event?.location || "",
    image: booking.event?.mainImage || "",
    quantity: booking.quantity,
    totalPrice: Number(booking.totalPrice),
    status: booking.status.toLowerCase(),
    purchaseDate: booking.createdAt.toISOString().split("T")[0],
    tickets: booking.tickets || [],
    payment: booking.payment ? { status: booking.payment.status, amount: Number(booking.payment.amount) } : null,
    user: booking.user ? { name: `${booking.user.firstName} ${booking.user.lastName}`, email: booking.user.email } : undefined,
  };
}
