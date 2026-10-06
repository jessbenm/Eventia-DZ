import { OAuth2Client } from "google-auth-library";
import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/AppError.js";
import {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  parseExpiresInMs,
} from "../../../utils/jwt.util.js";
import { env } from "../../../config/env.js";
import { sendWelcomeEmail, sendLoginNotificationEmail } from "../../../utils/email.util.js";
import { createNotification } from "../../../utils/notification.util.js";

const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, "Cet email est déjà utilisé");

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone,
      passwordHash,
      role: "USER",
      provider: "LOCAL",
    },
  });

  const tokens = await createTokens(user.id, user.email, user.role);

  await createNotification(user.id, "REGISTRATION", "Bienvenue sur EVENTIA", "Votre compte a été créé avec succès.");
  sendWelcomeEmail(user.email, user.firstName).catch(console.error);

  return { user: sanitizeUser(user), ...tokens };
}

export async function loginUser(
  email: string,
  password: string,
  meta?: { ip: string; browser: string }
) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) throw new AppError(401, "Aucun compte trouvé avec cet email");
  if (user.provider === "GOOGLE" && !user.passwordHash) {
    throw new AppError(401, "Ce compte utilise Google. Connectez-vous avec Google.");
  }
  if (!user.passwordHash) throw new AppError(401, "Email ou mot de passe incorrect");

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new AppError(401, "Mot de passe incorrect");

  const tokens = await createTokens(user.id, user.email, user.role);

  const now = new Date();
  const loginMeta = {
    ip: meta?.ip || "Inconnue",
    browser: meta?.browser || "Inconnu",
    date: now.toLocaleDateString("fr-FR"),
    time: now.toLocaleTimeString("fr-FR"),
  };

  await createNotification(user.id, "LOGIN", "Connexion réussie", `Connexion depuis ${loginMeta.ip}`, loginMeta);
  sendLoginNotificationEmail(user.email, user.firstName, loginMeta).catch(console.error);

  return { user: sanitizeUser(user), ...tokens };
}

export async function googleAuth(
  credential: string,
  meta?: { ip: string; browser: string }
) {
  if (!googleClient || !env.GOOGLE_CLIENT_ID) {
    throw new AppError(503, "Google OAuth non configuré");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) throw new AppError(401, "Token Google invalide");

  const email = payload.email.toLowerCase();
  const googleId = payload.sub;
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
  });

  const isNew = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        firstName: payload.given_name || payload.name?.split(" ")[0] || "Utilisateur",
        lastName: payload.family_name || payload.name?.split(" ").slice(1).join(" ") || "",
        avatar: payload.picture,
        provider: "GOOGLE",
        role: "USER",
      },
    });
    await createNotification(user.id, "REGISTRATION", "Bienvenue sur EVENTIA", "Compte créé via Google.");
    sendWelcomeEmail(user.email, user.firstName).catch(console.error);
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, avatar: user.avatar || payload.picture, provider: "GOOGLE" },
    });
  }

  const tokens = await createTokens(user.id, user.email, user.role);

  if (!isNew) {
    const now = new Date();
    const loginMeta = {
      ip: meta?.ip || "Inconnue",
      browser: meta?.browser || "Google OAuth",
      date: now.toLocaleDateString("fr-FR"),
      time: now.toLocaleTimeString("fr-FR"),
    };
    await createNotification(user.id, "LOGIN", "Connexion Google", `Connexion via Google depuis ${loginMeta.ip}`, loginMeta);
    sendLoginNotificationEmail(user.email, user.firstName, loginMeta).catch(console.error);
  }

  return { user: sanitizeUser(user), ...tokens, isNew };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(401, "Refresh token invalide");
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token expiré");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AppError(401, "Utilisateur introuvable");

  const accessToken = signAccessToken({ userId: user.id, email: user.email, role: user.role });
  return { accessToken, user: sanitizeUser(user) };
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bookings: { where: { status: "CONFIRMED" } } },
  });
  if (!user) throw new AppError(404, "Utilisateur introuvable");

  const ticketCount = user.bookings.reduce((s, b) => s + b.quantity, 0);
  return {
    ...sanitizeUser(user),
    premium: ticketCount >= 3,
    ticketsCount: ticketCount,
  };
}

async function createTokens(userId: string, email: string, role: "USER" | "ADMIN") {
  const accessToken = signAccessToken({ userId, email, role });
  const refreshToken = signRefreshToken({ userId });
  const expiresAt = new Date(Date.now() + parseExpiresInMs(env.JWT_REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });
  return { accessToken, refreshToken };
}

function sanitizeUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  role: "USER" | "ADMIN";
  provider?: "LOCAL" | "GOOGLE";
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider || "LOCAL",
    joinDate: user.createdAt.toISOString(),
  };
}
