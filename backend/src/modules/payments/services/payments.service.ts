import Stripe from "stripe";
import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";
import { env } from "../../../config/env.js";
import { generateTicketsForBooking } from "../../tickets/services/tickets.service.js";
import { sendPurchaseEmail } from "../../../utils/email.util.js";
import { createNotification } from "../../../utils/notification.util.js";

function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.startsWith("sk_test_your")) return null;
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createPaymentIntent(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, user: true },
  });
  if (!booking) throw new AppError(404, "Réservation introuvable");
  if (booking.userId !== userId) throw new AppError(403, "Accès refusé");
  if (booking.status !== "PENDING") throw new AppError(400, "Réservation déjà traitée");

  const amount = Number(booking.totalPrice);
  const stripe = getStripe();

  let payment = await prisma.payment.findUnique({ where: { bookingId } });
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        userId,
        bookingId,
        amount: booking.totalPrice,
        currency: env.STRIPE_CURRENCY,
        status: "PENDING",
      },
    });
  }

  if (stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: env.STRIPE_CURRENCY,
      metadata: { bookingId, userId },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeIntentId: intent.id },
    });

    return { clientSecret: intent.client_secret, paymentId: payment.id, amount, currency: env.STRIPE_CURRENCY };
  }

  // Mode dev sans Stripe : simulation directe
  return { clientSecret: null, paymentId: payment.id, amount, currency: env.STRIPE_CURRENCY, simulate: true };
}

export async function confirmPayment(userId: string, bookingId: string, paymentIntentId?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, user: true, payment: true },
  });
  if (!booking) throw new AppError(404, "Réservation introuvable");
  if (booking.userId !== userId) throw new AppError(403, "Accès refusé");
  if (booking.status === "CONFIRMED") {
    const tickets = await generateTicketsForBooking(bookingId);
    return { booking, tickets, alreadyConfirmed: true };
  }

  const stripe = getStripe();
  if (stripe && paymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded") throw new AppError(400, "Paiement non confirmé");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } });
    await tx.payment.update({
      where: { bookingId },
      data: { status: "SUCCEEDED", stripePaymentId: paymentIntentId || `sim_${bookingId}` },
    });
    return tx.booking.findUnique({ where: { id: bookingId }, include: { event: true, user: true } });
  });

  const tickets = await generateTicketsForBooking(bookingId);
  if (result) {
    await createNotification(
      userId,
      "TICKET_PURCHASE",
      "Achat confirmé",
      `${booking.quantity} billet(s) pour « ${result.event.title} »`,
      { eventId: result.eventId, amount: Number(booking.totalPrice) }
    );
    sendPurchaseEmail(
      result.user.email,
      result.user.firstName,
      result.event.title,
      booking.quantity,
      Number(booking.totalPrice)
    ).catch(console.error);
  }

  return { booking: result, tickets };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  const stripe = getStripe();
  if (!stripe) return;

  const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;
    if (bookingId) {
      await confirmPayment(intent.metadata.userId, bookingId, intent.id);
    }
  }
}

export async function getMyPayments(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { booking: { include: { event: true } } },
    orderBy: { createdAt: "desc" },
  });
  return payments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    eventTitle: p.booking.event.title,
    date: p.createdAt.toISOString(),
  }));
}

export async function getAllPayments() {
  const payments = await prisma.payment.findMany({
    include: { booking: { include: { event: true } }, user: true },
    orderBy: { createdAt: "desc" },
  });
  return payments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    eventTitle: p.booking.event.title,
    user: `${p.user.firstName} ${p.user.lastName}`,
    email: p.user.email,
    date: p.createdAt.toISOString(),
  }));
}
