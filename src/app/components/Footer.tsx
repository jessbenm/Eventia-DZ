import { Ticket, Instagram, Twitter, Facebook, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { isAdmin, isLoggedIn } = useAuth();

  const navLinks = [
    { label: "Accueil", page: "home" },
    { label: "Événements", page: "events" },
    ...(isLoggedIn ? [{ label: "Mon Dashboard", page: "dashboard" }] : []),
    ...(isAdmin ? [{ label: "Administration", page: "admin" }] : []),
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #090909 0%, #12100e 100%)",
        borderTop: "1px solid rgba(212,175,103,0.2)",
      }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4af67, transparent)", filter: "blur(60px)" }}
      />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <button onClick={() => onNavigate("home")} className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #d4af67, #e6c27a)", boxShadow: "0 0 20px rgba(212,175,103,0.45)" }}
              >
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>EVENTIA</div>
                <div className="text-xs" style={{ color: "#c4b5fd" }}>by Nahid</div>
              </div>
            </button>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#8b8bae" }}>
              La plateforme premium de réservation d'événements à Oran, Algérie. Vivez des expériences inoubliables.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: "rgba(212,175,103,0.12)", border: "1px solid rgba(212,175,103,0.25)", color: "#ead9b3" }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>Navigation</h4>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <li key={item.page}>
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="text-sm transition-colors hover:text-amber-200"
                    style={{ color: "#b8ae9d" }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white mb-4" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem" }}>Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,103,0.12)" }}>
                  <Mail className="w-4 h-4" style={{ color: "#d4af67" }} />
                </div>
                <span className="text-sm" style={{ color: "#8b8bae" }}>contact@eventia.dz</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,103,0.12)" }}>
                  <Phone className="w-4 h-4" style={{ color: "#d4af67" }} />
                </div>
                <span className="text-sm" style={{ color: "#8b8bae" }}>+213 555 12 34 56</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,103,0.12)" }}>
                  <MapPin className="w-4 h-4" style={{ color: "#d4af67" }} />
                </div>
                <span className="text-sm" style={{ color: "#8b8bae" }}>Oran, Algérie</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
        >
          <p className="text-xs" style={{ color: "#8b8bae" }}>
            © 2025 EVENTIA by Nahid. Tous droits réservés. — Oran, Algérie
          </p>
          <div className="flex gap-6">
            {["Mentions légales", "Confidentialité", "CGV"].map((item) => (
              <button key={item} className="text-xs transition-colors hover:text-purple-400" style={{ color: "#8b8bae" }}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
