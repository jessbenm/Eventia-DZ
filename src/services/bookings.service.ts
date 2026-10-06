import { api } from "../lib/api.client";

export interface TicketItem {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  location: string;
  quantity: number;
  totalPrice: number;
  status: string;
  qrCode: string;
  purchaseDate: string;
  image?: string;
}

export async function fetchMyTickets(): Promise<TicketItem[]> {
  return api.get<TicketItem[]>("/tickets/my");
}

export async function fetchTicketQr(ticketId: string): Promise<{ qrCode: string; dataUrl: string }> {
  return api.get(`/tickets/${ticketId}/qr`);
}

export async function createBooking(eventId: string, quantity: number) {
  return api.post<{ id: string; totalPrice: number }>("/bookings", { eventId, quantity });
}

export async function confirmPayment(bookingId: string) {
  return api.post("/payments/confirm", { bookingId });
}

export async function fetchMyBookings() {
  return api.get("/bookings/my");
}

export async function fetchAdminStats() {
  return api.get("/statistics/overview");
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tickets: number;
  spent: number;
  premium: boolean;
}

export async function fetchAdminUsers(params?: { page?: number; search?: string; sortBy?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.search) query.set("search", params.search);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  const qs = query.toString();
  const res = await api.get<AdminUser[]>(`/users${qs ? `?${qs}` : ""}`);
  return res;
}

export async function updateProfile(data: { firstName?: string; lastName?: string; phone?: string }) {
  return api.put("/users/me", data);
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export async function fetchNotifications(page = 1) {
  return api.get<{ items: AppNotification[]; unread: number }>(`/notifications?page=${page}`);
}

export async function markNotificationRead(id: string) {
  return api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return api.patch("/notifications/read-all");
}
