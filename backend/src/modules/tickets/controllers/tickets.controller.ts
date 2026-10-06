import type { Request, Response, NextFunction } from "express";
import * as ticketsService from "../services/tickets.service.js";

export async function myTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const tickets = await ticketsService.getMyTickets(req.user!.userId);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}

export async function validate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketsService.validateTicket(req.body.qrCode);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function downloadQr(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await ticketsService.getTicketQrImage(String(req.params.id), req.user!.userId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const tickets = await ticketsService.getAllTickets();
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}
