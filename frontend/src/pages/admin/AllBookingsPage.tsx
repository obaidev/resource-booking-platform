import { useEffect, useState } from "react";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";
import type { AdminBooking } from "../../types/bookings";

function AllBookingsPage() {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/booking", token);

        setBookings(data.bookings || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch bookings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-header">
          <h1>All Bookings</h1>
          <p>View all bookings across the platform.</p>
        </div>

        <div className="admin-bookings-list">
          {[1, 2].map((item) => (
            <div className="admin-booking-card" key={item}>
              <div className="admin-skeleton admin-skeleton-booking-title" />
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line" />
              <div className="admin-skeleton admin-skeleton-line short" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <div className="admin-header">
          <h1>All Bookings</h1>
          <p>View all bookings across the platform.</p>
        </div>

        <div className="admin-error" role="alert">
          {error}
        </div>
      </main>
    );
  }

  if (bookings.length === 0) {
    return (
      <main className="admin-page">
        <div className="admin-header">
          <h1>All Bookings</h1>
          <p>View all bookings across the platform.</p>
        </div>

        <div className="admin-empty-state">
          <h2>No bookings found</h2>
          <p>There are currently no booking records in the system.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <h1>All Bookings</h1>
          <p>View all bookings across the platform.</p>
        </div>

        <div className="admin-booking-count">
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
        </div>
      </div>

      <section className="admin-bookings-list">
        {bookings.map((booking) => (
          <article className="admin-booking-card" key={booking._id}>
            <div className="admin-booking-top">
              <div>
                <h2>{booking.resource?.name || "Unknown resource"}</h2>

                <p className="admin-booking-type">
                  {booking.resource?.type || "Unknown type"}
                </p>
              </div>

              <span className={`admin-status admin-status-${booking.status}`}>
                {booking.status}
              </span>
            </div>

            <div className="admin-booking-grid">
              <div className="admin-booking-detail">
                <span>Customer</span>
                <strong>{booking.user?.name || "Unknown customer"}</strong>
                <small>{booking.user?.email || "Unknown email"}</small>
              </div>

              <div className="admin-booking-detail">
                <span>Workspace</span>
                <strong>
                  {booking.resource?.workspace?.name || "Unknown workspace"}
                </strong>
                <small>
                  {booking.resource?.workspace?.address || "Unknown address"}
                </small>
              </div>

              <div className="admin-booking-detail">
                <span>Start</span>
                <strong>
                  {new Date(booking.startTime).toLocaleDateString()}
                </strong>
                <small>
                  {new Date(booking.startTime).toLocaleTimeString()}
                </small>
              </div>

              <div className="admin-booking-detail">
                <span>End</span>
                <strong>
                  {new Date(booking.endTime).toLocaleDateString()}
                </strong>
                <small>{new Date(booking.endTime).toLocaleTimeString()}</small>
              </div>

              <div className="admin-booking-detail admin-booking-price">
                <span>Total price</span>
                <strong>Rs. {booking.totalPrice.toLocaleString()}</strong>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AllBookingsPage;
