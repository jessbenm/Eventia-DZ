import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

let configured = false;

function ensureConfig() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(503, "Cloudinary non configuré. Ajoutez les clés dans .env");
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
}

export async function uploadImage(base64OrUrl: string, folder = "eventia/events") {
  ensureConfig();
  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder,
    resource_type: "image",
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string) {
  ensureConfig();
  await cloudinary.uploader.destroy(publicId);
}
