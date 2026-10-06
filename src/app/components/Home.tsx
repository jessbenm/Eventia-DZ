import { useState, useEffect, useRef } from "react";
import { ArrowRight, Star, Users, Calendar, Award, ChevronLeft, ChevronRight, Play, MapPin, Clock } from "lucide-react";
import { fetchEvents, fetchPublicStats, type Event } from "../../services/events.service";
import { formatPrice } from "../../lib/api.client";

interface HomeProps {
  onNavigate: (page: string, eventId?: string) => void;
}

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

export function Home({ onNavigate }: HomeProps) {
  const [statsVisible, setStatsVisible] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  const [publicStats, setPublicStats] = useState({ totalUsers: 0, ticketsSold: 0, satisfaction: 98 });

  useEffect(() => {
    fetchPublicStats().then(setPublicStats).catch(console.error);
  }, []);

  const events = useCountUp(publicStats.ticketsSold || 0, 2000, statsVisible);
  const users = useCountUp(publicStats.totalUsers || 0, 2000, statsVisible);
  const satisfaction = useCountUp(publicStats.satisfaction || 98, 1500, statsVisible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    { name: "Nadia B.", role: "Chef d'entreprise à Oran", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&auto=format", text: "EVENTIA a simplifié l'organisation de nos sorties et concerts. Le service est fluide, moderne et vraiment pensé pour notre public local.", rating: 5 },
    { name: "Yacine M.", role: "Entrepreneur", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&auto=format", text: "Je réserve mes billets en quelques clics, sans stress. Enfin une plateforme locale qui comprend nos besoins et nos événements.", rating: 5 },
    { name: "Imene R.", role: "Organisatrice d'événements", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format", text: "Le design est premium, les fonctionnalités utiles et surtout tout est adapté à notre réalité algérienne. C'est très crédible.", rating: 5 },
  ];

  const sponsors = ["Jazair", "Djezzy", "Cevital", "Télécom Algeria", "Mairie d'Oran", "Air Algérie", "Oran Night", "Cultura"];

  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents()
      .then((events) => setFeaturedEvents(events.filter((e) => e.featured).slice(0, 3)))
      .catch(() => setFeaturedEvents([]));
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#090909" }}>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 20% 20%, rgba(212,175,103,0.18), transparent 22%), radial-gradient(circle at 80% 30%, rgba(212,175,103,0.12), transparent 18%), linear-gradient(135deg, #090909 0%, #11100e 35%, #090909 100%)" }} />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(212,175,103,0.18), transparent)",
              filter: "blur(60px)",
              top: "10%", left: "5%",
              animation: "float 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-72 h-72 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(230,194,122,0.12), transparent)",
              filter: "blur(50px)",
              bottom: "20%", right: "10%",
              animation: "float 10s ease-in-out infinite reverse",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
              style={{
                background: "rgba(212,175,103,0.06)",
                border: "1px solid rgba(212,175,103,0.5)",
                color: "#ead9b3",
                backdropFilter: "blur(10px)",
              }}
            >
              <Play className="w-3 h-3" style={{ fill: "#d4af67", color: "#d4af67" }} />
              <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                Plateforme officielle de réservation des billets chez Eventia DZ
              </span>
            </div>

            <h1
              className="text-white mb-6 leading-none"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.05em",
              }}
            >
              Vivez des
              <span
                className="block"
                style={{
                  background: "linear-gradient(135deg, #f3efe8 0%, #d7c39b 32%, #d4af67 62%, #f0d19c 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                expériences
              </span>
              inoubliables.
            </h1>

            <p
              className="text-lg mb-10 max-w-xl leading-relaxed"
              style={{ color: "rgba(245,239,231,0.72)", fontFamily: "Inter, sans-serif" }}
            >
              Découvrez et réservez les meilleurs événements chez Eventia DZ, avec une expérience de réservation digne du luxe.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("events")}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #d4af67, #e6c27a)",
                  boxShadow: "0 8px 32px rgba(212,175,103,0.32)",
                  color: "#120d09",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                Découvrir les événements
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate("auth")}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(10,10,10,0.35)",
                  border: "1px solid rgba(212,175,103,0.5)",
                  color: "#f5efe7",
                  backdropFilter: "blur(10px)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                }}
              >
                Créer un compte gratuit
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: "rgba(245,239,231,0.5)" }}>
          <div className="w-px h-12" style={{ background: "linear-gradient(to bottom, rgba(212,175,103,0.9), transparent)" }} />
          <span className="text-xs" style={{ fontFamily: "Inter, sans-serif" }}>Scroll</span>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 relative">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(217,179,109,0.06), rgba(212,175,103,0.08), rgba(217,179,109,0.06))" }}
        />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Billets vendus", value: events.toLocaleString("fr-FR"), suffix: "+", icon: "🎫" },
              { label: "Utilisateurs actifs", value: users.toLocaleString("fr-FR"), suffix: "+", icon: "👥" },
              { label: "Oran", value: "🇩🇿", suffix: "", icon: "🌍" },
              { label: "Satisfaction client", value: satisfaction.toLocaleString("fr-FR"), suffix: "%", icon: "⭐" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-6 rounded-2xl"
                style={{
                  background: "rgba(17,16,14,0.68)",
                  border: "1px solid rgba(217,179,109,0.18)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div
                  className="text-white mb-1"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2rem" }}
                >
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm" style={{ color: "#8b8bae" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="text-sm mb-3" style={{ color: "#d9b36d", fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              À la une
            </div>
            <h2
              className="text-white"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
            >
              Événements populaires
            </h2>
          </div>
          <button
            onClick={() => onNavigate("events")}
            className="hidden md:flex items-center gap-2 text-sm transition-colors hover:text-[#f5d8a0]"
            style={{ color: "#d9b36d", fontFamily: "Inter, sans-serif", fontWeight: 500 }}
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredEvents.map((event) => (
            <div
              key={event.id}
              className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2"
              style={{
                background: "rgba(17,16,14,0.8)",
                border: "1px solid rgba(217,179,109,0.16)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
              }}
              onClick={() => onNavigate("event-detail", event.id)}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,9,26,0.8), transparent)" }} />
                <div className="absolute top-3 right-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ background: "rgba(217,179,109,0.85)", color: "#120f0d", backdropFilter: "blur(10px)", fontWeight: 700 }}
                  >
                    {event.category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1">
                  <Star className="w-3 h-3" style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                  <span className="text-xs text-white font-semibold">{event.rating}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>({event.reviews.toLocaleString()})</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-white mb-3 line-clamp-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1rem" }}>
                  {event.title}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: "#d9b36d" }} />
                    {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                    <MapPin className="w-3.5 h-3.5" style={{ color: "#d9b36d" }} />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#8b8bae" }}>
                    <Users className="w-3.5 h-3.5" style={{ color: "#d9b36d" }} />
                    {event.availableSeats} places restantes
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
                    className="px-4 py-2 rounded-xl text-sm text-white transition-all duration-200 hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #caa45b, #d9b36d)", boxShadow: "0 4px 15px rgba(217,179,109,0.28)", fontWeight: 600, color: "#120f0d" }}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20" style={{ background: "linear-gradient(180deg, rgba(14,14,14,0.7), rgba(17,16,14,0.38))" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-sm mb-3" style={{ color: "#d9b36d", fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Témoignages
            </div>
            <h2 className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
              Ce que nos clients disent
            </h2>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div
              className="p-8 rounded-3xl text-center"
              style={{
                background: "rgba(16,15,13,0.82)",
                border: "1px solid rgba(217,179,109,0.28)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
              }}
            >
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5" style={{ fill: "#fbbf24", color: "#fbbf24" }} />
                ))}
              </div>
              <p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "rgba(240,238,255,0.9)", fontFamily: "Inter, sans-serif", fontStyle: "italic" }}
              >
                "{testimonials[testimonialIndex].text}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <img
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].name}
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: "2px solid rgba(217,179,109,0.55)" }}
                />
                <div className="text-left">
                  <div className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                    {testimonials[testimonialIndex].name}
                  </div>
                  <div className="text-sm" style={{ color: "#8b8bae" }}>{testimonials[testimonialIndex].role}</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(217,179,109,0.12)", border: "1px solid rgba(217,179,109,0.35)", color: "#f4e7cc" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === testimonialIndex ? "24px" : "8px",
                    height: "8px",
                    background: i === testimonialIndex ? "#d9b36d" : "rgba(217,179,109,0.3)",
                  }}
                />
              ))}
              <button
                onClick={() => setTestimonialIndex((i) => (i + 1) % testimonials.length)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(217,179,109,0.12)", border: "1px solid rgba(217,179,109,0.35)", color: "#f4e7cc" }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor}
              className="px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "rgba(17,16,14,0.72)",
                border: "1px solid rgba(217,179,109,0.18)",
                color: "#c7c2bb",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              {sponsor}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div
          className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(217,179,109,0.08), rgba(17,16,14,0.88))",
            border: "1px solid rgba(217,179,109,0.32)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center top, rgba(217,179,109,0.18), transparent 70%)" }}
          />
          <Award className="w-12 h-12 mx-auto mb-6" style={{ color: "#d9b36d" }} />
          <h2
            className="text-white mb-4"
            style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
          >
            Prêt à vivre l'expérience EVENTIA ?
          </h2>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(240,238,255,0.7)", fontFamily: "Inter, sans-serif" }}>
            Rejoignez {publicStats.totalUsers > 0 ? `plus de ${publicStats.totalUsers.toLocaleString("fr-DZ")}` : "la communauté"} utilisateurs qui font confiance à EVENTIA pour leurs sorties premium.
          </p>
          <button
            onClick={() => onNavigate("events")}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #caa45b, #d9b36d)",
              boxShadow: "0 8px 32px rgba(217,179,109,0.3)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              fontSize: "1rem",
              color: "#120f0d",
            }}
          >
            Explorer les événements <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
