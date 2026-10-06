import type { Request, Response, NextFunction } from "express";
import * as usersService from "../services/users.service.js";

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await usersService.getAllUsers({
      page: parseInt(String(req.query.page || "1"), 10),
      limit: parseInt(String(req.query.limit || "10"), 10),
      search: req.query.search as string | undefined,
      sortBy: req.query.sortBy as string | undefined,
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    });
    res.json({ success: true, data: data.items, pagination: data.pagination });
  } catch (err) {
    next(err);
  }
}
