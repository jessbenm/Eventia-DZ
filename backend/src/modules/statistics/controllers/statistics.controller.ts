import type { Request, Response, NextFunction } from "express";
import * as statisticsService from "../services/statistics.service.js";

export async function overview(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statisticsService.getOverview();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function publicStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statisticsService.getPublicStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function revenue(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statisticsService.getRevenueStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}
