import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "root";
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      next(new AppError(400, "Données invalides", errors));
      return;
    }
    req[source] = result.data;
    next();
  };
}
