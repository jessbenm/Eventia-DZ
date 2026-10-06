import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star, Timer, ChevronLeft, ChevronRight, Ticket, Share2, Heart } from "lucide-react";
import { fetchEventById, type Event } from "../../services/events.service";
import { formatPrice } from "../../lib/api.client";

interface EventDetailProps {
  eventId: string;
  onNavigate: (page: string, eventId?: string) => void;
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) return setTime({ d: 0, h: 0, m: 0, s: 0 });
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3">
      {[
        { val: time.d, label: "Jours" },
        { val: time.h, label: "Heures" },
        { val: time.m, label: "Min" },
        { val: time.s, label: "Sec" },
      ].map(({ val, label }) => (
        <div key={label} className="text-center">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white mb-1"
            style={{
              background: "rgba(124,58,237,0.2)",
              border: "1px solid rgba(124,58,237,0.3)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: "1.5rem",
            }}
          >
            {String(val).padStart(2, "0")}
          </div>
          <span className="text-xs" style={{ color: "#8b8bae" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function EventDetail({ eventId, onNavigate }: EventDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [liked, setLiked] = useState(false);

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

  const allImages = [event.coverImage, ...event.gallery];
  const fillPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);

  return (
    <div className="min-h-screen pt-16" style={{ background: "#07091a" }}>
      {/* Hero Cover */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img
          src={allImages[galleryIndex]}
          alt={event.title}
          className="w-full h-full object-cover transition-all duration-700"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(7,9,26,0.3) 0%, rgba(7,9,26,0.95) 100%)" }} />

        {/* Gallery controls */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => setGalleryIndex((i) => (i - 1 + allImages.length) % allImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", color: "white" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setGalleryIndex((i) => (i + 1) % allImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", color: "white" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className="rounded-full transition-all"
                  style={{ width: i === galleryIndex ? "20px" : "8px", height: "8px", background: i === galleryIndex ? "white" : "rgba(255,255,255,0.4)" }}
                />
              ))}
            </div>
          </>
        )}

        {/* Back button */}
        <button
          onClick={() => onNavigate("events")}
          className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-all hover:scale-105"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setLiked(!liked)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)" }}
          >
            <Heart className="w-5 h-5" style={{ fill: liked ? "#ef4444" : "none", color: liked ? "#ef4444" : "white" }} />
          </button>
          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", color: "white" }}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setGalleryIndex(i)}
              className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
              style={{
                border: i === galleryIndex ? "2px solid #a855f7" : "2px solid transparent",
                opacity: i === galleryIndex ? 1 : 0.6,
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & meta */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm text-white"
                  style={{ background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.4)", fontWeight: 600 }}
                >
                  {event.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                  <span className="text-white font-semibold">{event.rating}</span>
                  <span style={{ color: "#8b8bae" }}>({event.reviews.toLocaleString()} avis)</span>
                </div>
              </div>
              <h1
                className="text-white mb-6"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.5rem)", lineHeight: 1.2 }}
              >
                {event.title}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
                  { icon: Clock, label: "Heure", value: `${event.time} — ${event.endTime}` },
                  { icon: MapPin, label: "Lieu", value: event.location },
                  { icon: Timer, label: "Durée", value: event.duration },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4" style={{ color: "#a855f7" }} />
                      <span className="text-xs" style={{ color: "#8b8bae" }}>{label}</span>
                    </div>
                    <span className="text-sm text-white" style={{ fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <h3 className="text-white mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>À propos</h3>
              <p className="leading-relaxed" style={{ color: "rgba(240,238,255,0.75)", fontFamily: "Inter, sans-serif", lineHeight: 1.8 }}>
                {event.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.25)", color: "#c4b5fd" }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Programme */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
                Programme de la journée
              </h3>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(to bottom, #7c3aed, rgba(124,58,237,0.1))" }} />
                <div className="space-y-6">
                  {event.program.map((item, i) => (
                    <div key={i} className="flex gap-6 relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 relative z-10"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", fontWeight: 700 }}
                      >
                        {i + 1}
                      </div>
                      <div className="pt-2">
                        <div className="text-xs mb-1" style={{ color: "#a855f7", fontWeight: 600 }}>{item.time}</div>
                        <div className="text-white mb-0.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{item.title}</div>
                        {item.speaker && <div className="text-sm" style={{ color: "#8b8bae" }}>{item.speaker}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collaborateurs */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
                Artistes & Collaborateurs
              </h3>
              <div className="flex flex-wrap gap-4">
                {event.collaborators.map((collab) => (
                  <div
                    key={collab.name}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    <img src={collab.avatar} alt={collab.name} className="w-10 h-10 rounded-full object-cover" style={{ border: "2px solid rgba(124,58,237,0.4)" }} />
                    <div>
                      <div className="text-white text-sm" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{collab.name}</div>
                      <div className="text-xs" style={{ color: "#8b8bae" }}>{collab.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsors */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <h3 className="text-white mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.1rem" }}>
                Sponsors & Partenaires
              </h3>
              <div className="flex flex-wrap gap-3">
                {event.sponsors.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    style={{ background: "rgba(26,29,61,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                  >
                    <span className="text-xl">{s.logo}</span>
                    <span className="text-white text-sm" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Booking card */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 p-6 rounded-2xl"
              style={{
                background: "rgba(15,17,40,0.9)",
                border: "1px solid rgba(124,58,237,0.3)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
            >
              {/* Price */}
              <div className="mb-6">
                <span className="text-sm" style={{ color: "#8b8bae" }}>Prix par billet</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className="text-white"
                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "2.5rem" }}
                  >
                    {formatPrice(event.price)}
                  </span>
                  <span className="text-sm" style={{ color: "#8b8bae" }}>/ personne</span>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4" style={{ color: "#a855f7" }} />
                  <span className="text-sm text-white" style={{ fontWeight: 500 }}>Compte à rebours</span>
                </div>
                <Countdown targetDate={`${event.date}T${event.time}`} />
              </div>

              {/* Availability */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: "#8b8bae" }}>
                    <Users className="w-3.5 h-3.5 inline mr-1" style={{ color: "#a855f7" }} />
                    {event.availableSeats.toLocaleString("fr-FR")} places restantes
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: fillPercent > 80 ? "rgba(239,68,68,0.2)" : "rgba(124,58,237,0.2)", color: fillPercent > 80 ? "#ef4444" : "#a855f7" }}
                  >
                    {fillPercent}% complet
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.15)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${fillPercent}%`,
                      background: fillPercent > 80 ? "linear-gradient(90deg, #ef4444, #f97316)" : "linear-gradient(90deg, #7c3aed, #a855f7)",
                    }}
                  />
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => onNavigate("reservation", event.id)}
                className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  boxShadow: "0 8px 32px rgba(124,58,237,0.5)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                <Ticket className="w-5 h-5" />
                Réserver maintenant
              </button>

              <p className="text-xs text-center mt-3" style={{ color: "#8b8bae" }}>
                🔒 Paiement 100% sécurisé • Remboursement garanti
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
