import type { Request, Response, NextFunction } from "express";
import * as bookingsService from "../services/bookings.service.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingsService.createBooking(req.user!.userId, req.body.eventId, req.body.quantity);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function myBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const bookings = await bookingsService.getMyBookings(req.user!.userId);
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await bookingsService.cancelBooking(req.user!.userId, String(req.params.id));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const bookings = await bookingsService.getAllBookings();
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}
