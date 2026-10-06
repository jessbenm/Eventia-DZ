import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Authentification requise"));
    return;
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "Token invalide ou expiré"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "Authentification requise"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "Accès refusé"));
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
