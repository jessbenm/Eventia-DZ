import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, Minus, Plus, CheckCircle, Ticket } from "lucide-react";
import { fetchEventById, type Event } from "../../services/events.service";
import { createBooking } from "../../services/bookings.service";
import { formatPrice } from "../../lib/api.client";

interface ReservationProps {
  eventId: string;
  onNavigate: (page: string, eventId?: string, quantity?: number, bookingId?: string) => void;
}

export function Reservation({ eventId, onNavigate }: ReservationProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventId) fetchEventById(eventId).then(setEvent).catch(console.error);
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "#07091a" }}>
        <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const total = event.price * quantity;
  const fees = Math.round(total * 0.05);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Requis";
    if (!form.lastName.trim()) e.lastName = "Requis";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Email invalide";
    if (!form.phone.trim()) e.phone = "Requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const booking = await createBooking(eventId, quantity);
      onNavigate("payment", eventId, quantity, booking.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: "#07091a" }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Back */}
        <button
          onClick={() => onNavigate("event-detail", eventId)}
          className="flex items-center gap-2 mb-8 text-sm transition-colors hover:text-purple-400"
          style={{ color: "#8b8bae" }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'événement
        </button>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-10">
          {[{ label: "Informations", step: 1 }, { label: "Paiement", step: 2 }, { label: "Confirmation", step: 3 }].map((s, i) => (
            <div key={s.step} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: s.step === 1 ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(124,58,237,0.15)",
                  border: s.step === 1 ? "none" : "1px solid rgba(124,58,237,0.3)",
                  color: s.step === 1 ? "white" : "#8b8bae",
                  fontWeight: 700,
                }}
              >
                {s.step}
              </div>
              <span className="text-sm" style={{ color: s.step === 1 ? "white" : "#8b8bae", fontWeight: s.step === 1 ? 600 : 400 }}>
                {s.label}
              </span>
              {i < 2 && <div className="w-12 h-px" style={{ background: "rgba(124,58,237,0.2)" }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div
              className="p-8 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(20px)" }}
            >
              <h2 className="text-white mb-8" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
                Vos informations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Prénom *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                    <input
                      type="text"
                      placeholder="Sophie"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none transition-all"
                      style={{
                        background: "rgba(26,29,61,0.8)",
                        border: `1px solid ${errors.firstName ? "#ef4444" : "rgba(124,58,237,0.2)"}`,
                      }}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Nom *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                    <input
                      type="text"
                      placeholder="Martin"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none transition-all"
                      style={{
                        background: "rgba(26,29,61,0.8)",
                        border: `1px solid ${errors.lastName ? "#ef4444" : "rgba(124,58,237,0.2)"}`,
                      }}
                    />
                  </div>
                  {errors.lastName && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.lastName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                    <input
                      type="email"
                      placeholder="sophie@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none transition-all"
                      style={{
                        background: "rgba(26,29,61,0.8)",
                        border: `1px solid ${errors.email ? "#ef4444" : "rgba(124,58,237,0.2)"}`,
                      }}
                    />
                  </div>
                  {errors.email && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Téléphone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                    <input
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none transition-all"
                      style={{
                        background: "rgba(26,29,61,0.8)",
                        border: `1px solid ${errors.phone ? "#ef4444" : "rgba(124,58,237,0.2)"}`,
                      }}
                    />
                  </div>
                  {errors.phone && <p className="text-xs mt-1" style={{ color: "#ef4444" }}>{errors.phone}</p>}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <label className="block text-sm mb-4" style={{ color: "#c4b5fd", fontWeight: 500 }}>Nombre de billets</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "white" }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span
                    className="w-16 text-center text-white text-xl"
                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)", color: "white" }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm" style={{ color: "#8b8bae" }}>Max 10 billets par commande</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.4)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                Continuer vers le paiement
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div
              className="p-6 rounded-2xl sticky top-24"
              style={{ background: "rgba(15,17,40,0.9)", border: "1px solid rgba(124,58,237,0.3)", backdropFilter: "blur(20px)" }}
            >
              <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
                Récapitulatif
              </h3>

              {/* Event card */}
              <div
                className="p-4 rounded-xl mb-6"
                style={{ background: "rgba(26,29,61,0.6)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                <img src={event.image} alt={event.title} className="w-full h-28 object-cover rounded-lg mb-3" />
                <div className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>
                  {event.title}
                </div>
                <div className="text-xs" style={{ color: "#8b8bae" }}>
                  {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} • {event.time}
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8b8bae" }}>Prix unitaire</span>
                  <span className="text-white">{formatPrice(event.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8b8bae" }}>Quantité</span>
                  <span className="text-white">× {quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8b8bae" }}>Frais de service (5%)</span>
                  <span className="text-white">{formatPrice(fees)}</span>
                </div>
              </div>

              <div
                className="flex justify-between py-4 mt-4"
                style={{ borderTop: "1px solid rgba(124,58,237,0.2)" }}
              >
                <span className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>Total</span>
                <span
                  className="text-white"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#a855f7" }}
                >
                  {formatPrice(total + fees)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs mt-2" style={{ color: "#8b8bae" }}>
                <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                Remboursable jusqu'à 48h avant l'événement
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
