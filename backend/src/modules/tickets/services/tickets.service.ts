import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";
import { generateTicketQrCode, generateQrDataUrl } from "../../../utils/qrcode.util.js";

export async function generateTicketsForBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tickets: true },
  });
  if (!booking) throw new AppError(404, "Réservation introuvable");
  if (booking.tickets.length > 0) return booking.tickets;

  const tickets = [];
  for (let i = 0; i < booking.quantity; i++) {
    const qrCode = await generateTicketQrCode(bookingId, i);
    const ticket = await prisma.ticket.create({
      data: { bookingId, qrCode, status: "VALID" },
    });
    tickets.push(ticket);
  }
  return tickets;
}

export async function getMyTickets(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId, status: "CONFIRMED" },
    include: { event: true, tickets: true },
    orderBy: { createdAt: "desc" },
  });

  return bookings.flatMap((booking) =>
    booking.tickets.map((ticket) => ({
      id: ticket.id,
      bookingId: booking.id,
      eventId: booking.eventId,
      eventTitle: booking.event.title,
      date: booking.event.date.toISOString().split("T")[0],
      location: booking.event.location,
      quantity: 1,
      totalPrice: Number(booking.totalPrice) / booking.quantity,
      status: ticket.status.toLowerCase() === "valid" ? "confirmed" : ticket.status.toLowerCase(),
      qrCode: ticket.qrCode,
      purchaseDate: booking.createdAt.toISOString().split("T")[0],
      image: booking.event.mainImage,
    }))
  );
}

export async function validateTicket(qrCode: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: { booking: { include: { event: true, user: true } } },
  });
  if (!ticket) throw new AppError(404, "Billet invalide");
  if (ticket.status === "USED") throw new AppError(400, "Billet déjà utilisé");
  if (ticket.status === "CANCELLED") throw new AppError(400, "Billet annulé");

  await prisma.ticket.update({ where: { id: ticket.id }, data: { status: "USED" } });

  return {
    valid: true,
    ticket: {
      id: ticket.id,
      eventTitle: ticket.booking.event.title,
      holder: `${ticket.booking.user.firstName} ${ticket.booking.user.lastName}`,
      date: ticket.booking.event.date,
    },
  };
}

export async function getTicketQrImage(ticketId: string, userId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { booking: true },
  });
  if (!ticket) throw new AppError(404, "Billet introuvable");
  if (ticket.booking.userId !== userId) throw new AppError(403, "Accès refusé");

  const dataUrl = await generateQrDataUrl(ticket.qrCode);
  return { qrCode: ticket.qrCode, dataUrl };
}

export async function getAllTickets() {
  const tickets = await prisma.ticket.findMany({
    include: {
      booking: { include: { event: true, user: true } },
    },
    orderBy: { generatedAt: "desc" },
  });

  return tickets.map((t) => ({
    id: t.id,
    qrCode: t.qrCode,
    status: t.status,
    eventTitle: t.booking.event.title,
    holder: `${t.booking.user.firstName} ${t.booking.user.lastName}`,
    email: t.booking.user.email,
    generatedAt: t.generatedAt,
  }));
}
