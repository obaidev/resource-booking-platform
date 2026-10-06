import { useEffect, useState } from "react";
import type { OwnerBooking } from "../../types/bookings";
import OwnerBookingCard from "../../components/owner/OwnerBookingCard";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function OwnerBookings() {
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      try {
        const data = await apiFetch("/booking/workspace", token);

        setBookings(data.bookings);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load bookings");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (isLoading) {
    return (
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1>Workspace Bookings</h1>
            <p>View bookings made for your workspace resources.</p>
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
            <h1>Workspace Bookings</h1>
            <p>View bookings made for your workspace resources.</p>
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
          <h1>Workspace Bookings</h1>
          <p>View bookings made for your workspace resources.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h2>No bookings yet</h2>
          <p>Bookings for your resources will appear here.</p>
        </div>
      ) : (
        <div className="owner-bookings-grid">
          {bookings.map((booking) => (
            <OwnerBookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </main>
  );
}

export default OwnerBookings;
