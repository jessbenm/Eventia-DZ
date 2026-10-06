import { api } from "../lib/api.client";

export interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  city: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image: string;
  coverImage: string;
  gallery: string[];
  description: string;
  duration: string;
  tags: string[];
  collaborators: { name: string; role: string; avatar: string }[];
  sponsors: { name: string; logo: string }[];
  program: { time: string; title: string; speaker: string }[];
  featured: boolean;
  rating: number;
  reviews: number;
  status?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  duration: string;
  location: string;
  city?: string;
  capacity: number;
  price: number;
  mainImage: string;
  gallery?: string[];
  featured?: boolean;
}

export async function fetchEvents(params?: { search?: string; priceMax?: number; sortBy?: string }): Promise<Event[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.priceMax) query.set("priceMax", String(params.priceMax));
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  const qs = query.toString();
  return api.get<Event[]>(`/events${qs ? `?${qs}` : ""}`);
}

export async function fetchEventById(id: string): Promise<Event> {
  return api.get<Event>(`/events/${id}`);
}

export async function fetchAdminEvents(): Promise<Event[]> {
  return api.get<Event[]>("/events?admin=true");
}

export async function createEvent(data: EventFormData): Promise<Event> {
  return api.post<Event>("/events", { ...data, city: data.city || "Oran", gallery: data.gallery || [] });
}

export async function updateEvent(id: string, data: Partial<EventFormData>): Promise<Event> {
  return api.put<Event>(`/events/${id}`, data);
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}

export async function publishEvent(id: string): Promise<Event> {
  return api.patch<Event>(`/events/${id}/publish`, {});
}

export async function disableEvent(id: string): Promise<Event> {
  return api.patch<Event>(`/events/${id}/disable`, {});
}

export async function uploadEventImage(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const result = await api.post<{ url: string }>("/upload/event-image", { image: base64 });
  return result.url;
}

export async function fetchPublicStats() {
  return api.get<{ totalUsers: number; totalEvents: number; ticketsSold: number; satisfaction: number }>("/statistics/public");
}
