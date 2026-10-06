import { AppError } from "../utils/AppError.js";

export function errorHandler(
  err: Error,
  _req: unknown,
  res: { status: (code: number) => { json: (body: unknown) => void } },
  _next: unknown
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Erreur interne du serveur",
  });
}
