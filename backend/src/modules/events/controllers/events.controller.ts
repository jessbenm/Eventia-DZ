import type { Request, Response, NextFunction } from "express";
import * as eventsService from "../services/events.service.js";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user?.role === "ADMIN";
    const events = await eventsService.listEvents({ ...req.query, admin: isAdmin && req.query.admin === "true" });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.user?.role === "ADMIN";
    const event = await eventsService.getEventById(String(req.params.id), isAdmin);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventsService.createEvent(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventsService.updateEvent(String(req.params.id), req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await eventsService.deleteEvent(String(req.params.id));
    res.json({ success: true, message: "Événement supprimé" });
  } catch (err) {
    next(err);
  }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventsService.publishEvent(String(req.params.id));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function disable(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventsService.disableEvent(String(req.params.id));
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}
