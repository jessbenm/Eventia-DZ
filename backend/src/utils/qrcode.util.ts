import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";

export async function generateTicketQrCode(bookingId: string, index: number): Promise<string> {
  const code = `EVTIA-${bookingId.slice(0, 8).toUpperCase()}-${String(index + 1).padStart(3, "0")}-${uuidv4().slice(0, 8).toUpperCase()}`;
  return code;
}

export async function generateQrDataUrl(data: string): Promise<string> {
  return QRCode.toDataURL(data, { width: 256, margin: 2 });
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
