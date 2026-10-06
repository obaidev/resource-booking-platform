import { useEffect, useState } from "react";
import type { Booking } from "../../types/bookings";
import { BookingCard } from "../../components/customer/BookingCard";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiFetch("/booking/my-bookings", token);

        setBookings(data.bookings);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load bookings.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  const handleBookingCancelled = (bookingId: string) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, status: "cancelled" }
          : booking,
      ),
    );
  };

  if (isLoading) {
    return (
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1>My Bookings</h1>
            <p>View and manage your workspace bookings.</p>
          </div>
        </div>

        <div className="state-message">
          <p>Loading bookings...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1>My Bookings</h1>
            <p>View and manage your workspace bookings.</p>
          </div>
        </div>

        <div className="state-message error-message">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1>My Bookings</h1>
          <p>View and manage your workspace bookings.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h2>No bookings yet</h2>
          <p>
            You haven't made any bookings yet. Browse available resources to get
            started.
          </p>
        </div>
      ) : (
        <div className="customer-bookings-grid">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleBookingCancelled}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default MyBookings;
