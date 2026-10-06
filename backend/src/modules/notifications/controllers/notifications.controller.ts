import type { Request, Response, NextFunction } from "express";
import * as notificationsService from "../services/notifications.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(String(req.query.page || "1"), 10);
    const limit = parseInt(String(req.query.limit || "20"), 10);
    const data = await notificationsService.getMyNotifications(req.user!.userId, page, limit);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await notificationsService.markAsRead(req.user!.userId, String(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notificationsService.markAllAsRead(req.user!.userId);
    res.json({ success: true, message: "Toutes les notifications marquées comme lues" });
  } catch (err) {
    next(err);
  }
}
