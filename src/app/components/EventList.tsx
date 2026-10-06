import { useState, useMemo, useEffect } from "react";
import { Search, Filter, MapPin, Calendar, Clock, Users, ChevronDown, Star, Timer } from "lucide-react";
import { fetchEvents, type Event } from "../../services/events.service";
import { formatPrice } from "../../lib/api.client";

interface EventListProps {
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
    <div className="flex items-center gap-1.5">
      <Timer className="w-3 h-3 flex-shrink-0" style={{ color: "#d9b36d" }} />
      <span className="text-xs" style={{ color: "#f4e7cc", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
        {time.d}j {String(time.h).padStart(2, "0")}h {String(time.m).padStart(2, "0")}m
      </span>
    </div>
  );
}

export function EventList({ onNavigate }: EventListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priceMax, setPriceMax] = useState(15000);
  const [sortBy, setSortBy] = useState("date");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents({ sortBy })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sortBy]);

  const filtered = useMemo(() => {
    let result = events.filter((e) => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase());
      const matchPrice = e.price <= priceMax;
      return matchSearch && matchPrice;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "date") result = [...result].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return result;
  }, [events, search, priceMax, sortBy]);

  return (
    <div className="min-h-screen pt-20" style={{ background: "#090909" }}>
      <div
        className="py-16 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, rgba(217,179,109,0.15) 0%, transparent 100%)" }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at center top, rgba(217,179,109,0.14), transparent)" }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-sm mb-3" style={{ color: "#d9b36d", fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Événements à Oran
          </div>
          <h1
            className="text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
          >
            Découvrez votre prochain événement
          </h1>
          <p className="max-w-xl" style={{ color: "#8b8bae", fontFamily: "Inter, sans-serif" }}>
            {filtered.length} événement{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""} à Oran, Algérie
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div
          className="p-4 rounded-2xl mb-8"
          style={{ background: "rgba(17,16,14,0.8)", border: "1px solid rgba(217,179,109,0.2)", backdropFilter: "blur(20px)" }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder:text-neutral-500 outline-none transition-colors"
                style={{
                  background: "rgba(18,17,15,0.9)",
                  border: "1px solid rgba(217,179,109,0.2)",
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 rounded-xl text-white outline-none cursor-pointer"
                style={{
                  background: "rgba(18,17,15,0.9)",
                  border: "1px solid rgba(217,179,109,0.2)",
                  fontFamily: "Inter, sans-serif",
                  minWidth: "160px",
                }}
              >
                <option value="date" style={{ background: "#0d1033" }}>Par date</option>
                <option value="price-asc" style={{ background: "#0d1033" }}>Prix croissant</option>
                <option value="price-desc" style={{ background: "#0d1033" }}>Prix décroissant</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#8b8bae" }} />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all"
              style={{
                background: showFilters ? "rgba(217,179,109,0.18)" : "rgba(18,17,15,0.9)",
                border: `1px solid ${showFilters ? "rgba(217,179,109,0.5)" : "rgba(217,179,109,0.2)"}`,
                color: "#f4e7cc",
              }}
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}>
              <div className="flex items-center gap-6">
                <label className="text-sm text-white" style={{ fontFamily: "Inter, sans-serif" }}>
                  Prix max: <span style={{ color: "#d9b36d" }}>{formatPrice(priceMax)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={500}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="flex-1 max-w-xs accent-amber-500"
                  style={{ accentColor: "#d9b36d" }}
                />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-[#d9b36d]/30 border-t-[#d9b36d] rounded-full animate-spin mx-auto mb-4" />
            <p style={{ color: "#8b8bae" }}>Chargement des événements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-white mb-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Aucun événement trouvé</h3>
            <p style={{ color: "#8b8bae" }}>Essayez d'ajuster vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => {
              const fillPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);
              return (
                <div
                  key={event.id}
                  className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                  style={{
                    background: "rgba(17,16,14,0.8)",
                    border: "1px solid rgba(217,179,109,0.15)",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
                  }}
                  onClick={() => onNavigate("event-detail", event.id)}
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,9,26,0.9), rgba(7,9,26,0.1))" }} />

                    <div className="absolute top-3 left-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs text-white"
                        style={{ background: "rgba(217,179,109,0.9)", color: "#120f0d", backdropFilter: "blur(8px)", fontWeight: 700 }}
                      >
                        Oran
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                      <Star className="w-3 h-3" style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                      <span className="text-xs text-white font-semibold">{event.rating}</span>
                    </div>

                    {event.availableSeats < 200 && (
                      <div
                        className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs text-white"
                        style={{ background: "rgba(239,68,68,0.85)", backdropFilter: "blur(8px)", fontWeight: 600 }}
                      >
                        🔥 Presque complet!
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-white mb-3 line-clamp-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d9b36d" }} />
                        {new Date(event.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d9b36d" }} />
                        {event.time} — {event.endTime}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d9b36d" }} />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                        <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#d9b36d" }} />
                        {event.availableSeats.toLocaleString("fr-DZ")} places restantes
                      </div>
                    </div>

                    <div className="mb-4 py-2 px-3 rounded-lg" style={{ background: "rgba(217,179,109,0.08)", border: "1px solid rgba(217,179,109,0.15)" }}>
                      <Countdown targetDate={event.date + "T" + event.time} />
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1" style={{ color: "#8b8bae" }}>
                        <span>Remplissage</span>
                        <span style={{ color: fillPercent > 80 ? "#ef4444" : "#d9b36d" }}>{fillPercent}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.15)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${fillPercent}%`,
                            background: fillPercent > 80
                              ? "linear-gradient(90deg, #ef4444, #f97316)"
                              : "linear-gradient(90deg, #7c3aed, #a855f7)",
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs" style={{ color: "#8b8bae" }}>À partir de</span>
                        <div className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.25rem" }}>
                          {formatPrice(event.price)}
                        </div>
                      </div>
                      <button
                        className="px-5 py-2.5 rounded-xl text-sm text-white transition-all duration-200 hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                          boxShadow: "0 4px 15px rgba(124,58,237,0.4)",
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 600,
                        }}
                      >
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
