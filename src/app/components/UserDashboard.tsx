import { useState, useEffect } from "react";
import { Ticket, Calendar, User, Settings, LogOut, QrCode, Clock, ChevronRight, Edit3, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchMyTickets, fetchTicketQr, updateProfile, type TicketItem } from "../../services/bookings.service";
import { formatPrice } from "../../lib/api.client";

interface UserDashboardProps {
  onNavigate: (page: string, eventId?: string) => void;
  onLogout: () => void;
}

function QRCodeDisplay({ ticketId, code }: { ticketId: string; code: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchTicketQr(ticketId).then((r) => setDataUrl(r.dataUrl)).catch(() => setDataUrl(null));
  }, [ticketId]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 rounded-xl flex items-center justify-center mb-2" style={{ background: "white", padding: "8px" }}>
        {dataUrl ? <img src={dataUrl} alt="QR" className="w-full h-full" /> : (
          <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        )}
      </div>
      <span className="text-xs text-center" style={{ color: "#8b8bae", fontFamily: "monospace" }}>{code}</span>
    </div>
  );
}

export function UserDashboard({ onNavigate, onLogout }: UserDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"tickets" | "history" | "upcoming" | "profile" | "settings">("tickets");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [userTickets, setUserTickets] = useState<TicketItem[]>([]);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });

  useEffect(() => {
    fetchMyTickets().then(setUserTickets).catch(console.error);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
      });
    }
  }, [user]);

  const upcoming = userTickets.filter((t) => new Date(t.date) >= new Date());
  const totalSpent = userTickets.reduce((sum, t) => sum + t.totalPrice, 0);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileForm);
      setEditingProfile(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (!user) return null;

  const tabs = [
    { id: "tickets" as const, label: "Mes billets", icon: Ticket },
    { id: "upcoming" as const, label: "À venir", icon: Calendar },
    { id: "history" as const, label: "Historique", icon: Clock },
    { id: "profile" as const, label: "Profil", icon: User },
    { id: "settings" as const, label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen pt-20" style={{ background: "#07091a" }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User card */}
            <div
              className="p-6 rounded-2xl mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.15))",
                border: "1px solid rgba(124,58,237,0.3)",
                backdropFilter: "blur(20px)",
              }}
            >
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format"}
                alt={user.firstName}
                className="w-16 h-16 rounded-2xl object-cover mb-4"
                style={{ border: "3px solid rgba(124,58,237,0.5)" }}
              />
              <div className="text-white mb-0.5" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm mb-4" style={{ color: "#c4b5fd" }}>{user.email}</div>
              {user.premium && (
                <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full w-fit" style={{ background: "rgba(124,58,237,0.3)", color: "#e9d5ff" }}>
                  💎 Membre Premium
                </div>
              )}
            </div>

            {/* Stats */}
            <div
              className="p-4 rounded-2xl mb-6"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              {[
                { label: "Billets achetés", value: userTickets.length, icon: "🎫" },
                { label: "Total dépensé", value: formatPrice(totalSpent), icon: "💰" },
                { label: "Événements à venir", value: upcoming.length, icon: "📅" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between py-3"
                  style={{ borderBottom: "1px solid rgba(124,58,237,0.1)" }}
                >
                  <div className="flex items-center gap-2">
                    <span>{stat.icon}</span>
                    <span className="text-sm" style={{ color: "#8b8bae" }}>{stat.label}</span>
                  </div>
                  <span className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Nav */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 transition-all duration-200"
                  style={{
                    background: activeTab === id ? "rgba(124,58,237,0.2)" : "transparent",
                    borderLeft: activeTab === id ? "3px solid #a855f7" : "3px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" style={{ color: activeTab === id ? "#a855f7" : "#8b8bae" }} />
                    <span className="text-sm" style={{ color: activeTab === id ? "white" : "#8b8bae", fontWeight: activeTab === id ? 600 : 400 }}>
                      {label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: "#8b8bae" }} />
                </button>
              ))}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-red-500/10"
                style={{ borderTop: "1px solid rgba(124,58,237,0.1)" }}
              >
                <LogOut className="w-4 h-4" style={{ color: "#ef4444" }} />
                <span className="text-sm" style={{ color: "#ef4444", fontWeight: 500 }}>Déconnexion</span>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Tickets */}
            {(activeTab === "tickets" || activeTab === "upcoming") && (
              <div>
                <h2 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
                  {activeTab === "tickets" ? "Tous mes billets" : "Événements à venir"}
                </h2>
                <div className="space-y-4">
                  {(activeTab === "upcoming" ? upcoming : userTickets).map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl overflow-hidden transition-all duration-200"
                      style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Event image */}
                        <div className="md:w-48 h-32 md:h-auto overflow-hidden flex-shrink-0">
                          <img
                            src={ticket.image || ""}
                            alt={ticket.eventTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                                {ticket.eventTitle}
                              </h3>
                              <span
                                className="ml-3 px-2.5 py-1 rounded-full text-xs flex-shrink-0"
                                style={{
                                  background: ticket.status === "confirmed" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                                  color: ticket.status === "confirmed" ? "#22c55e" : "#ef4444",
                                  border: `1px solid ${ticket.status === "confirmed" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                                  fontWeight: 600,
                                }}
                              >
                                {ticket.status === "confirmed" ? "✓ Confirmé" : ticket.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#8b8bae" }}>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                                {new Date(ticket.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ticket className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
                                {ticket.quantity} billet{ticket.quantity > 1 ? "s" : ""}
                              </span>
                              <span style={{ color: "#c4b5fd" }}>{formatPrice(ticket.totalPrice)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xs" style={{ color: "#8b8bae" }}>
                              Acheté le {new Date(ticket.purchaseDate).toLocaleDateString("fr-FR")}
                            </span>
                            <button
                              onClick={() => setSelectedTicket(selectedTicket === ticket.id ? null : ticket.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:scale-105"
                              style={{
                                background: "rgba(124,58,237,0.15)",
                                border: "1px solid rgba(124,58,237,0.3)",
                                color: "#c4b5fd",
                                fontWeight: 600,
                              }}
                            >
                              <QrCode className="w-4 h-4" />
                              QR Code
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* QR Code panel */}
                      {selectedTicket === ticket.id && (
                        <div
                          className="px-5 pb-5 pt-4"
                          style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white mb-1" style={{ fontWeight: 600 }}>Votre billet numérique</p>
                              <p className="text-xs" style={{ color: "#8b8bae" }}>Présentez ce QR code à l'entrée</p>
                            </div>
                            <QRCodeDisplay ticketId={ticket.id} code={ticket.qrCode} />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {activeTab === "history" && (
              <div>
                <h2 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
                  Historique des commandes
                </h2>
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                >
                  <table className="w-full">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                        {["Événement", "Date", "Billets", "Total", "Statut"].map((h) => (
                          <th key={h} className="text-left px-6 py-4 text-xs" style={{ color: "#8b8bae", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {userTickets.map((ticket) => (
                        <tr key={ticket.id} style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white" style={{ fontWeight: 500 }}>{ticket.eventTitle}</div>
                            <div className="text-xs" style={{ color: "#8b8bae" }}>#{ticket.id}</div>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: "#8b8bae" }}>
                            {new Date(ticket.purchaseDate).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">{ticket.quantity}</td>
                          <td className="px-6 py-4 text-sm" style={{ color: "#a855f7", fontWeight: 700 }}>{formatPrice(ticket.totalPrice)}</td>
                          <td className="px-6 py-4">
                            <span
                              className="px-2.5 py-1 rounded-full text-xs"
                              style={{
                                background: "rgba(34,197,94,0.15)",
                                color: "#22c55e",
                                border: "1px solid rgba(34,197,94,0.3)",
                                fontWeight: 600,
                              }}
                            >
                              Confirmé
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Profile */}
            {activeTab === "profile" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
                    Mon profil
                  </h2>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd" }}
                  >
                    <Edit3 className="w-4 h-4" />
                    {editingProfile ? "Annuler" : "Modifier"}
                  </button>
                </div>

                <div
                  className="p-8 rounded-2xl"
                  style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                >
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <img src={user.avatar || ""} alt="" className="w-20 h-20 rounded-2xl object-cover" style={{ border: "3px solid rgba(124,58,237,0.4)" }} />
                      {editingProfile && (
                        <button
                          className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: "#7c3aed" }}
                        >
                          <Edit3 className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                    <div>
                      <div className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.25rem" }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm" style={{ color: "#8b8bae" }}>Membre depuis {new Date(user.joinDate || Date.now()).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      { label: "Prénom", key: "firstName" as const },
                      { label: "Nom", key: "lastName" as const },
                      { label: "Email", key: "email" as const, readonly: true },
                      { label: "Téléphone", key: "phone" as const },
                    ].map(({ label, key, readonly }) => (
                      <div key={label}>
                        <label className="block text-sm mb-2" style={{ color: "#c4b5fd", fontWeight: 500 }}>{label}</label>
                        <input
                          type="text"
                          value={key === "email" ? user.email : profileForm[key as "firstName" | "lastName" | "phone"]}
                          onChange={(e) => !readonly && setProfileForm({ ...profileForm, [key]: e.target.value })}
                          disabled={!editingProfile || readonly}
                          className="w-full px-4 py-3 rounded-xl text-white outline-none"
                          style={{
                            background: editingProfile && !readonly ? "rgba(26,29,61,0.8)" : "rgba(15,17,40,0.5)",
                            border: `1px solid ${editingProfile && !readonly ? "rgba(124,58,237,0.4)" : "rgba(124,58,237,0.1)"}`,
                            opacity: editingProfile ? 1 : 0.7,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {editingProfile && (
                    <button
                      onClick={handleSaveProfile}
                      className="mt-6 px-8 py-3 rounded-xl text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
                    >
                      Sauvegarder les modifications
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <div>
                <h2 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem" }}>
                  Paramètres du compte
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: Bell, title: "Notifications", desc: "Gérer vos préférences de notifications", badge: "Actif" },
                    { icon: Ticket, title: "Préférences d'événements", desc: "Villes et types d'événements favoris", badge: null },
                  ].map(({ icon: Icon, title, desc, badge }) => (
                    <div
                      key={title}
                      className="flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all hover:border-purple-500/30"
                      style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)" }}>
                          <Icon className="w-5 h-5" style={{ color: "#a855f7" }} />
                        </div>
                        <div>
                          <div className="text-white" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>{title}</div>
                          <div className="text-sm" style={{ color: "#8b8bae" }}>{desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {badge && (
                          <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: 600 }}>
                            {badge}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4" style={{ color: "#8b8bae" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
