import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Event, EventFormData } from "../../services/events.service";
import { uploadEventImage } from "../../services/events.service";

interface AdminEventModalProps {
  open: boolean;
  event?: Event | null;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
}

const inputStyle = {
  background: "rgba(26,29,61,0.8)",
  border: "1px solid rgba(124,58,237,0.2)",
};

export function AdminEventModal({ open, event, onClose, onSave }: AdminEventModalProps) {
  const [form, setForm] = useState<EventFormData>({
    title: "", description: "", date: "", time: "20:00", endTime: "23:00",
    duration: "3 heures", location: "", city: "Oran", capacity: 100, price: 1500,
    mainImage: "", featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        endTime: event.endTime,
        duration: event.duration,
        location: event.location,
        city: event.city,
        capacity: event.totalSeats,
        price: event.price,
        mainImage: event.image,
        featured: event.featured,
      });
    } else {
      setForm({
        title: "", description: "", date: "", time: "20:00", endTime: "23:00",
        duration: "3 heures", location: "", city: "Oran", capacity: 100, price: 1500,
        mainImage: "", featured: false,
      });
    }
    setError("");
  }, [event, open]);

  if (!open) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadEventImage(file);
      setForm({ ...form, mainImage: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.date || !form.location || !form.mainImage) {
      setError("Remplissez tous les champs obligatoires");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(7,9,26,0.85)" }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8"
        style={{ background: "rgba(15,17,40,0.95)", border: "1px solid rgba(124,58,237,0.3)", backdropFilter: "blur(20px)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
            {event ? "Modifier l'événement" : "Ajouter un événement"}
          </h2>
          <button onClick={onClose} className="text-white p-2"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <p className="mb-4 px-4 py-2 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Titre *", key: "title" as const, type: "text" },
            { label: "Lieu *", key: "location" as const, type: "text" },
            { label: "Date *", key: "date" as const, type: "date" },
            { label: "Heure début", key: "time" as const, type: "time" },
            { label: "Heure fin", key: "endTime" as const, type: "time" },
            { label: "Durée", key: "duration" as const, type: "text" },
            { label: "Capacité", key: "capacity" as const, type: "number" },
            { label: "Prix (DA)", key: "price" as const, type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>{label}</label>
              <input
                type={type}
                value={String(form[key] ?? "")}
                onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-white outline-none"
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Description *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-xl text-white outline-none resize-none"
            style={inputStyle}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Image principale *</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" style={{ color: "#8b8bae" }} />
          {form.mainImage && <img src={form.mainImage} alt="" className="mt-2 w-full h-32 object-cover rounded-xl" />}
        </div>

        <label className="flex items-center gap-2 mt-4 text-sm text-white">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Événement en vedette
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 py-4 rounded-xl text-white disabled:opacity-70"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
        >
          {loading ? "Enregistrement..." : event ? "Mettre à jour" : "Créer l'événement"}
        </button>
      </div>
    </div>
  );
}
