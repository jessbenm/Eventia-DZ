import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Shield, CheckCircle, Lock } from "lucide-react";
import { fetchEventById, type Event } from "../../services/events.service";
import { confirmPayment } from "../../services/bookings.service";
import { formatPrice } from "../../lib/api.client";

interface PaymentProps {
  eventId: string;
  quantity: number;
  bookingId: string;
  onNavigate: (page: string) => void;
}

export function Payment({ eventId, quantity, bookingId, onNavigate }: PaymentProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [method, setMethod] = useState<"card" | "paypal" | "stripe">("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
  const grandTotal = total + fees;

  const formatCard = (val: string) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handlePay = async () => {
    if (!bookingId) {
      alert("Réservation introuvable. Veuillez recommencer.");
      onNavigate("events");
      return;
    }
    setLoading(true);
    try {
      await confirmPayment(bookingId);
      setSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur de paiement");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: "#07091a" }}>
        <div className="text-center max-w-md px-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 0 60px rgba(124,58,237,0.6)" }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2
            className="text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2rem" }}
          >
            Paiement confirmé !
          </h2>
          <p className="mb-2 text-lg" style={{ color: "rgba(240,238,255,0.8)" }}>
            {event.title}
          </p>
          <p className="mb-8" style={{ color: "#8b8bae" }}>
            {quantity} billet{quantity > 1 ? "s" : ""} • {formatPrice(grandTotal)} payé
          </p>
          <p className="text-sm mb-8" style={{ color: "#8b8bae" }}>
            Un email de confirmation avec vos billets (QR code) a été envoyé à votre adresse.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onNavigate("dashboard")}
              className="px-6 py-3 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              Mes billets
            </button>
            <button
              onClick={() => onNavigate("events")}
              className="px-6 py-3 rounded-xl"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
            >
              Voir d'autres événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20" style={{ background: "#07091a" }}>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => onNavigate("reservation")}
          className="flex items-center gap-2 mb-8 text-sm transition-colors hover:text-purple-400"
          style={{ color: "#8b8bae" }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la réservation
        </button>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-10">
          {[{ label: "Informations", step: 1 }, { label: "Paiement", step: 2 }, { label: "Confirmation", step: 3 }].map((s, i) => (
            <div key={s.step} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: s.step <= 2 ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(124,58,237,0.15)",
                  border: s.step <= 2 ? "none" : "1px solid rgba(124,58,237,0.3)",
                  color: s.step <= 2 ? "white" : "#8b8bae",
                  fontWeight: 700,
                }}
              >
                {s.step < 2 ? <CheckCircle className="w-4 h-4" /> : s.step}
              </div>
              <span className="text-sm" style={{ color: s.step <= 2 ? "white" : "#8b8bae", fontWeight: s.step <= 2 ? 600 : 400 }}>
                {s.label}
              </span>
              {i < 2 && <div className="w-12 h-px" style={{ background: s.step <= 2 ? "rgba(124,58,237,0.5)" : "rgba(124,58,237,0.2)" }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment form */}
          <div className="lg:col-span-2">
            <div
              className="p-8 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.2)", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Shield className="w-6 h-6" style={{ color: "#22c55e" }} />
                <h2 className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
                  Paiement sécurisé
                </h2>
              </div>

              {/* Payment methods */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { id: "card" as const, label: "Carte bancaire", icon: "💳" },
                  { id: "paypal" as const, label: "PayPal", icon: "🅿️" },
                  { id: "stripe" as const, label: "Stripe", icon: "⚡" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className="py-4 px-3 rounded-xl text-center transition-all duration-200"
                    style={{
                      background: method === m.id ? "rgba(124,58,237,0.2)" : "rgba(26,29,61,0.6)",
                      border: `2px solid ${method === m.id ? "#7c3aed" : "rgba(124,58,237,0.15)"}`,
                    }}
                  >
                    <div className="text-2xl mb-2">{m.icon}</div>
                    <div className="text-xs text-white" style={{ fontWeight: 500 }}>{m.label}</div>
                  </button>
                ))}
              </div>

              {method === "card" && (
                <div className="space-y-5">
                  {/* Card number */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Numéro de carte</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                        style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                      />
                    </div>
                  </div>

                  {/* Cardholder name */}
                  <div>
                    <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Nom du titulaire</label>
                    <input
                      type="text"
                      placeholder="SOPHIE MARTIN"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                      style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>Date d'expiration</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                        className="w-full px-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                        style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>CVV</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={4}
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                          style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security badges */}
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <Shield className="w-5 h-5 flex-shrink-0" style={{ color: "#22c55e" }} />
                    <p className="text-xs" style={{ color: "#8b8bae" }}>
                      Vos données sont chiffrées avec SSL 256-bit. Nous ne stockons jamais vos informations de carte bancaire.
                    </p>
                  </div>
                </div>
              )}

              {method !== "card" && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">{method === "paypal" ? "🅿️" : "⚡"}</div>
                  <p className="text-white mb-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                    Payer avec {method === "paypal" ? "PayPal" : "Stripe"}
                  </p>
                  <p className="text-sm" style={{ color: "#8b8bae" }}>
                    Vous serez redirigé vers {method === "paypal" ? "PayPal" : "Stripe"} pour compléter votre paiement sécurisé.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              className="p-6 rounded-2xl sticky top-24"
              style={{ background: "rgba(15,17,40,0.9)", border: "1px solid rgba(124,58,237,0.3)", backdropFilter: "blur(20px)" }}
            >
              <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
                Récapitulatif
              </h3>

              <div
                className="p-4 rounded-xl mb-6"
                style={{ background: "rgba(26,29,61,0.6)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                <img src={event.image} alt={event.title} className="w-full h-24 object-cover rounded-lg mb-3" />
                <div className="text-white text-sm" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{event.title}</div>
                <div className="text-xs mt-1" style={{ color: "#8b8bae" }}>
                  {quantity} billet{quantity > 1 ? "s" : ""}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8b8bae" }}>Sous-total</span>
                  <span className="text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#8b8bae" }}>Frais de service</span>
                  <span className="text-white">{formatPrice(fees)}</span>
                </div>
              </div>

              <div
                className="flex justify-between py-4 mb-6"
                style={{ borderTop: "1px solid rgba(124,58,237,0.2)" }}
              >
                <span className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "#a855f7" }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Payer {formatPrice(grandTotal)}
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 mt-4">
                {["Visa", "MC", "PayPal", "Apple Pay"].map((b) => (
                  <span key={b} className="text-xs" style={{ color: "#8b8bae" }}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
