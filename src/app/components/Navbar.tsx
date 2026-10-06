import { useState, useEffect, useRef } from "react";
import { Menu, X, Bell, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from "../../services/bookings.service";
import wolfLogo from "../../assets/eventia-wolf.svg";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const { isLoggedIn, isAdmin, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchNotifications()
      .then((res) => {
        setNotifications(res.items);
        setUnreadCount(res.unread);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationRead(notif.id).catch(() => {});
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const navLinks = [
    { label: "Accueil", page: "home" },
    { label: "Événements", page: "events" },
    ...(isLoggedIn ? [{ label: "Mon Compte", page: "dashboard" }] : []),
    ...(isAdmin ? [{ label: "Administration", page: "admin" }] : []),
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(10,10,10,0.88)" : "rgba(10,10,10,0.18)",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(212,175,103,0.24)" : "none",
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.38)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => onNavigate("home")} className="flex items-center gap-3 group">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,103,0.16), rgba(12,10,9,0.8))",
              borderColor: "rgba(212,175,103,0.42)",
              boxShadow: "0 0 18px rgba(212,175,103,0.28)",
            }}
          >
            <img src={wolfLogo} alt="Logo EVENTIA" className="w-10 h-10 object-contain" />
          </div>
          <div className="text-left">
            <div className="text-white leading-none" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
              EVENTIA
            </div>
            <div className="text-xs leading-none" style={{ color: "#d9b36d", fontWeight: 500 }}>
              DZ
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => onNavigate(link.page)}
              className="relative text-sm transition-colors duration-200 flex items-center gap-1.5"
              style={{
                color: currentPage === link.page ? "#d9b36d" : "rgba(245,239,231,0.8)",
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
              }}
            >
              {link.page === "admin" && <Shield className="w-3.5 h-3.5" />}
              {link.label}
              {currentPage === link.page && (
                <span
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #d4af67, #f0d19c)" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn && user ? (
            <>
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen((o) => !o)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors relative"
                  style={{ background: "rgba(212,175,103,0.15)", color: "#e8d6a9" }}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white"
                      style={{ background: "#d4af67", fontWeight: 700 }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div
                    className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
                    style={{ background: "rgba(17,15,13,0.98)", border: "1px solid rgba(212,175,103,0.28)", backdropFilter: "blur(20px)" }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(212,175,103,0.12)" }}>
                      <span className="text-sm text-white" style={{ fontWeight: 600 }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs" style={{ color: "#d9b36d" }}>
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-center" style={{ color: "#8b8bae" }}>Aucune notification</p>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleNotifClick(n)}
                            className="w-full text-left px-4 py-3 transition-colors"
                            style={{
                              borderBottom: "1px solid rgba(212,175,103,0.08)",
                              background: n.read ? "transparent" : "rgba(212,175,103,0.08)",
                            }}
                          >
                            <div className="text-sm text-white" style={{ fontWeight: n.read ? 400 : 600 }}>{n.title}</div>
                            <div className="text-xs mt-0.5 line-clamp-2" style={{ color: "#8b8bae" }}>{n.message}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => onNavigate("dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: "rgba(212,175,103,0.12)",
                  border: "1px solid rgba(212,175,103,0.35)",
                  color: "#e8d6a9",
                }}
              >
                <img
                  src={user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&auto=format"}
                  alt="avatar"
                  className="w-6 h-6 rounded-full object-cover"
                />
                {user.firstName} {user.lastName.charAt(0)}.
                <ChevronDown className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("auth")}
                className="text-sm transition-colors"
                style={{ color: "rgba(240,238,255,0.7)", fontWeight: 500 }}
              >
                Connexion
              </button>
              <button
                onClick={() => onNavigate("auth")}
                className="px-5 py-2.5 rounded-xl text-sm text-white transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #d4af67, #e6c27a)",
                  boxShadow: "0 4px 20px rgba(212,175,103,0.35)",
                  color: "#120d09",
                  fontWeight: 700,
                }}
              >
                S'inscrire
              </button>
            </>
          )}
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-4"
          style={{
            background: "rgba(7,9,26,0.98)",
            borderTop: "1px solid rgba(212,175,103,0.2)",
          }}
        >
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => { onNavigate(link.page); setMobileOpen(false); }}
              className="text-left py-2 text-sm"
              style={{ color: currentPage === link.page ? "#d9b36d" : "rgba(240,238,255,0.8)" }}
            >
              {link.label}
            </button>
          ))}
          {!isLoggedIn && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { onNavigate("auth"); setMobileOpen(false); }}
                className="flex-1 py-2.5 rounded-xl text-sm text-center"
                style={{ background: "linear-gradient(135deg, #d4af67, #e6c27a)", color: "#120d09", fontWeight: 700 }}
              >
                Connexion / Inscription
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
