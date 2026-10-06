import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./components/Home";
import { EventList } from "./components/EventList";
import { EventDetail } from "./components/EventDetail";
import { Reservation } from "./components/Reservation";
import { Payment } from "./components/Payment";
import { Auth } from "./components/Auth";
import { UserDashboard } from "./components/UserDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { useAuth } from "../context/AuthContext";

type Page =
  | "home"
  | "events"
  | "event-detail"
  | "reservation"
  | "payment"
  | "auth"
  | "dashboard"
  | "admin";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [reservationQuantity, setReservationQuantity] = useState<number>(1);
  const [bookingId, setBookingId] = useState<string>("");
  const { isLoggedIn, isAdmin, logout } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const navigate = (target: string, eventId?: string, quantity?: number, booking?: string) => {
    if (target === "admin" && !isAdmin) return;
    if (["dashboard", "reservation", "payment"].includes(target) && !isLoggedIn && target !== "auth") {
      setPage("auth");
      return;
    }
    if (eventId) setSelectedEventId(eventId);
    if (quantity !== undefined) setReservationQuantity(quantity);
    if (booking) setBookingId(booking);
    setPage(target as Page);
  };

  const showFooter = !["auth", "dashboard", "admin"].includes(page);
  const showNavbar = page !== "admin";

  const handleLogout = async () => {
    await logout();
    navigate("home");
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(circle at top, rgba(212,175,103,0.14), transparent 30%), #090909",
        fontFamily: "Inter, sans-serif",
        color: "#f5efe7",
      }}
    >
      {showNavbar && (
        <Navbar currentPage={page} onNavigate={navigate} />
      )}

      <main>
        {page === "home" && <Home onNavigate={navigate} />}
        {page === "events" && <EventList onNavigate={navigate} />}
        {page === "event-detail" && (
          <EventDetail eventId={selectedEventId} onNavigate={navigate} />
        )}
        {page === "reservation" && (
          <Reservation eventId={selectedEventId} onNavigate={navigate} />
        )}
        {page === "payment" && (
          <Payment
            eventId={selectedEventId}
            quantity={reservationQuantity}
            bookingId={bookingId}
            onNavigate={navigate}
          />
        )}
        {page === "auth" && <Auth onNavigate={navigate} />}
        {page === "dashboard" && (
          <UserDashboard onNavigate={navigate} onLogout={handleLogout} />
        )}
        {page === "admin" && isAdmin && <AdminDashboard onNavigate={navigate} />}
      </main>

      {showFooter && <Footer onNavigate={navigate} />}
    </div>
  );
}
