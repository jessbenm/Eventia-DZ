import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

import authRoutes from "./modules/auth/routes/auth.routes.js";
import eventsRoutes from "./modules/events/routes/events.routes.js";
import bookingsRoutes from "./modules/bookings/routes/bookings.routes.js";
import ticketsRoutes from "./modules/tickets/routes/tickets.routes.js";
import paymentsRoutes, { webhookRouter } from "./modules/payments/routes/payments.routes.js";
import usersRoutes from "./modules/users/routes/users.routes.js";
import statisticsRoutes from "./modules/statistics/routes/statistics.routes.js";
import notificationsRoutes from "./modules/notifications/routes/notifications.routes.js";
import uploadRoutes from "./modules/upload/routes/upload.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: [env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

  app.use("/api/payments/webhook", webhookRouter);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "EVENTIA API — Oran, Algérie" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/events", eventsRoutes);
  app.use("/api/bookings", bookingsRoutes);
  app.use("/api/tickets", ticketsRoutes);
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/statistics", statisticsRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/upload", uploadRoutes);

  app.use(errorHandler);

  return app;
}
