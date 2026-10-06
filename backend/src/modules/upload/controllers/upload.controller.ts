import type { Request, Response, NextFunction } from "express";
import { uploadImage } from "../../../utils/cloudinary.util.js";
import { AppError } from "../../../utils/AppError.js";

export async function uploadEventImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { image } = req.body as { image?: string };
    if (!image) throw new AppError(400, "Image requise (base64 ou URL)");

    const result = await uploadImage(image);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
