import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, Calendar, Ticket, Users, TrendingUp, Plus, Edit, Trash2, Search, ArrowUpRight, Shield
} from "lucide-react";
import {
  fetchAdminEvents, createEvent, updateEvent, deleteEvent, publishEvent,
  type Event, type EventFormData,
} from "../../services/events.service";
import { fetchAdminStats, fetchAdminUsers, type AdminUser } from "../../services/bookings.service";
import { formatPrice } from "../../lib/api.client";
import { AdminEventModal } from "./AdminEventModal";

const COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#3b82f6", "#06b6d4"];

function StatCard({ label, value, icon, trend, color }: { label: string; value: string; icon: string; trend: string; color: string }) {
  return (
    <div
      className="p-6 rounded-2xl"
      style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)", backdropFilter: "blur(10px)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </div>
      </div>
      <div className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "1.75rem" }}>{value}</div>
      <div className="text-sm" style={{ color: "#8b8bae" }}>{label}</div>
    </div>
  );
}

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "tickets" | "users">("overview");
  const [searchEvent, setSearchEvent] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<{
    totalEvents: number;
    activeEvents: number;
    completedEvents: number;
    totalUsers: number;
    totalTicketsSold: number;
    totalRevenue: number;
    fillRate: number;
    monthlyRevenueChart: { month: string; revenue: number; tickets: number }[];
    categoryBreakdown: { name: string; value: number }[];
  } | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const loadData = () => {
    fetchAdminEvents().then(setEvents).catch(console.error);
    fetchAdminStats().then(setStats).catch(console.error);
    fetchAdminUsers({ search: userSearch }).then(setUsers).catch(console.error);
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchAdminUsers({ search: userSearch }).then(setUsers).catch(console.error), 300);
    return () => clearTimeout(t);
  }, [userSearch]);

  const handleSaveEvent = async (data: EventFormData) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
    } else {
      const created = await createEvent(data);
      await publishEvent(created.id);
    }
    loadData();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Supprimer cet événement ?")) return;
    await deleteEvent(id);
    loadData();
  };

  const statusLabel = (s?: string) => {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      PUBLISHED: { label: "Actif", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
      DRAFT: { label: "Brouillon", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
      DISABLED: { label: "Désactivé", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
      COMPLETED: { label: "Terminé", color: "#8b8bae", bg: "rgba(107,114,128,0.15)" },
    };
    return map[s || "PUBLISHED"] || map.PUBLISHED;
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(searchEvent.toLowerCase()) ||
    e.location.toLowerCase().includes(searchEvent.toLowerCase())
  );

  const adminStats = stats || {
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalUsers: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    fillRate: 0,
    monthlyRevenueChart: [],
    categoryBreakdown: [{ name: "Oran", value: 100 }],
  };

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: "events" as const, label: "Événements", icon: Calendar },
    { id: "tickets" as const, label: "Billets", icon: Ticket },
    { id: "users" as const, label: "Utilisateurs", icon: Users },
  ];

  return (
    <div className="min-h-screen pt-20 flex" style={{ background: "#07091a" }}>
      {/* Sidebar */}
      <div
        className="w-64 flex-shrink-0 hidden lg:flex flex-col"
        style={{
          background: "rgba(13,16,51,0.95)",
          borderRight: "1px solid rgba(124,58,237,0.2)",
          backdropFilter: "blur(20px)",
          minHeight: "calc(100vh - 80px)",
        }}
      >
        {/* Admin badge */}
        <div className="p-6 border-b" style={{ borderColor: "rgba(124,58,237,0.15)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white text-sm" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>Administration</div>
              <div className="text-xs" style={{ color: "#8b8bae" }}>EVENTIA Dashboard</div>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200"
              style={{
                background: activeTab === id ? "rgba(124,58,237,0.2)" : "transparent",
                borderLeft: activeTab === id ? "3px solid #a855f7" : "3px solid transparent",
              }}
            >
              <Icon className="w-4 h-4" style={{ color: activeTab === id ? "#a855f7" : "#8b8bae" }} />
              <span className="text-sm" style={{ color: activeTab === id ? "white" : "#8b8bae", fontWeight: activeTab === id ? 600 : 400 }}>
                {label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile tabs */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{ background: "rgba(13,16,51,0.98)", borderTop: "1px solid rgba(124,58,237,0.2)" }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex-1 flex flex-col items-center gap-1 py-3"
            style={{ color: activeTab === id ? "#a855f7" : "#8b8bae" }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 pb-20 lg:pb-6 overflow-auto">
        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <div className="mb-8">
              <h1 className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
                Vue d'ensemble
              </h1>
              <p style={{ color: "#8b8bae" }}>Performances EVENTIA — {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Événements actifs" value={String(adminStats.activeEvents)} icon="📅" trend={`${adminStats.totalEvents} total`} color="#7c3aed" />
              <StatCard label="Billets vendus" value={adminStats.totalTicketsSold.toLocaleString("fr-DZ")} icon="🎫" trend={`${adminStats.totalUsers} users`} color="#a855f7" />
              <StatCard label="Revenus totaux" value={formatPrice(adminStats.totalRevenue)} icon="💰" trend="DA" color="#3b82f6" />
              <StatCard label="Taux de remplissage" value={`${adminStats.fillRate}%`} icon="📊" trend={`${adminStats.completedEvents} terminés`} color="#06b6d4" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue chart */}
              <div
                className="lg:col-span-2 p-6 rounded-2xl"
                style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                  Revenus mensuels (DA)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={adminStats.monthlyRevenueChart.length ? adminStats.monthlyRevenueChart : [{ month: "—", revenue: 0, tickets: 0 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                    <XAxis dataKey="month" stroke="#8b8bae" tick={{ fill: "#8b8bae", fontSize: 12 }} />
                    <YAxis stroke="#8b8bae" tick={{ fill: "#8b8bae", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "#0d1033", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }}
                      formatter={(v: number) => [formatPrice(v), "Revenus"]}
                    />
                    <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div
                className="p-6 rounded-2xl"
                style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
              >
                <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                  Par catégorie (%)
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={adminStats.categoryBreakdown} cx="50%" cy="50%" outerRadius={70} dataKey="value" stroke="none">
                      {adminStats.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#0d1033", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {adminStats.categoryBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: "#8b8bae" }}>{item.name}</span>
                      </div>
                      <span className="text-white font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tickets line chart */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                Billets vendus par mois
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={adminStats.monthlyRevenueChart.length ? adminStats.monthlyRevenueChart : [{ month: "—", revenue: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="month" stroke="#8b8bae" tick={{ fill: "#8b8bae", fontSize: 12 }} />
                  <YAxis stroke="#8b8bae" tick={{ fill: "#8b8bae", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0d1033", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                  <Line type="monotone" dataKey="tickets" stroke="#a855f7" strokeWidth={2} dot={{ fill: "#a855f7", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Events management */}
        {activeTab === "events" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
                  Gestion des événements
                </h1>
                <p style={{ color: "#8b8bae" }}>{events.length} événements à Oran</p>
              </div>
              <button
                onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)", fontFamily: "Poppins, sans-serif", fontWeight: 600 }}
              >
                <Plus className="w-4 h-4" /> Ajouter un événement
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchEvent}
                onChange={(e) => setSearchEvent(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
              />
            </div>

            {/* Events table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                    {["Événement", "Catégorie", "Date", "Prix", "Places", "Statut", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs" style={{ color: "#8b8bae", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => {
                    const fillPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);
                    return (
                      <tr key={event.id} className="transition-colors hover:bg-purple-900/5" style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            <div>
                              <div className="text-sm text-white" style={{ fontWeight: 600 }}>{event.title}</div>
                              <div className="text-xs" style={{ color: "#8b8bae" }}>{event.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs"
                            style={{ background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontWeight: 600 }}
                          >
                            {event.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm" style={{ color: "#8b8bae" }}>
                          {new Date(event.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </td>
                        <td className="px-5 py-4 text-sm text-white" style={{ fontWeight: 600 }}>{formatPrice(event.price)}</td>
                        <td className="px-5 py-4">
                          <div className="text-xs mb-1" style={{ color: "#8b8bae" }}>
                            {event.availableSeats.toLocaleString()}/{event.totalSeats.toLocaleString()}
                          </div>
                          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.15)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${fillPercent}%`,
                                background: fillPercent > 80 ? "#ef4444" : "linear-gradient(90deg, #7c3aed, #a855f7)",
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {(() => {
                            const st = statusLabel(event.status);
                            return (
                              <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: st.bg, color: st.color, fontWeight: 600 }}>
                                {st.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ background: "rgba(124,58,237,0.15)", color: "#a855f7" }}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tickets */}
        {activeTab === "tickets" && (
          <div>
            <h1 className="text-white mb-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
              Gestion des billets
            </h1>
            <p className="mb-8" style={{ color: "#8b8bae" }}>Vue d'ensemble des ventes de billets</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total billets vendus", value: adminStats.totalTicketsSold.toLocaleString("fr-DZ"), trend: "réel", icon: "🎫" },
                { label: "Revenus totaux", value: formatPrice(adminStats.totalRevenue), trend: "+18%", icon: "💰" },
                { label: "Prix moyen / billet", value: adminStats.totalTicketsSold ? formatPrice(Math.round(adminStats.totalRevenue / adminStats.totalTicketsSold)) : "—", trend: "+3%", icon: "📈" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-5 rounded-2xl"
                  style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
                >
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <div className="text-white mb-1" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "1.5rem" }}>{s.value}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "#8b8bae" }}>{s.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>{s.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sales by event */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <h3 className="text-white mb-6" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>
                Ventes par événement
              </h3>
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const sold = event.totalSeats - event.availableSeats;
                  const revenue = sold * event.price;
                  const fill = Math.round((sold / event.totalSeats) * 100);
                  return (
                    <div key={event.id} className="flex items-center gap-4">
                      <img src={event.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white truncate" style={{ fontWeight: 500 }}>{event.title}</span>
                          <span className="text-sm ml-4 flex-shrink-0" style={{ color: "#a855f7", fontWeight: 700 }}>{formatPrice(revenue)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(124,58,237,0.15)" }}>
                            <div className="h-full rounded-full" style={{ width: `${fill}%`, background: "linear-gradient(90deg, #7c3aed, #a855f7)" }} />
                          </div>
                          <span className="text-xs flex-shrink-0" style={{ color: "#8b8bae" }}>{sold.toLocaleString()} billets ({fill}%)</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div>
            <h1 className="text-white mb-2" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.75rem" }}>
              Gestion des utilisateurs
            </h1>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8b8bae" }} />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-white placeholder:text-neutral-600 outline-none"
                style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.2)" }}
              />
            </div>
            <p className="mb-8" style={{ color: "#8b8bae" }}>{adminStats.totalUsers} membres inscrits — {users.length} affichés</p>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(15,17,40,0.8)", border: "1px solid rgba(124,58,237,0.15)" }}
            >
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
                    {["Utilisateur", "Email", "Billets", "Total dépensé", "Statut", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs" style={{ color: "#8b8bae", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} className="transition-colors hover:bg-purple-900/5" style={{ borderBottom: "1px solid rgba(124,58,237,0.08)" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" style={{ border: "2px solid rgba(124,58,237,0.3)" }} />
                          <span className="text-sm text-white" style={{ fontWeight: 600 }}>{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#8b8bae" }}>{user.email}</td>
                      <td className="px-5 py-4 text-sm text-white" style={{ fontWeight: 600 }}>{user.tickets}</td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#a855f7", fontWeight: 700 }}>{formatPrice(user.spent)}</td>
                      <td className="px-5 py-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs"
                          style={{
                            background: user.premium ? "rgba(124,58,237,0.15)" : "rgba(107,114,128,0.15)",
                            color: user.premium ? "#c4b5fd" : "#9ca3af",
                            fontWeight: 600,
                          }}
                        >
                          {user.premium ? "💎 Premium" : "Gratuit"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.15)", color: "#a855f7" }}>
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AdminEventModal
        open={showEventModal}
        event={editingEvent}
        onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
