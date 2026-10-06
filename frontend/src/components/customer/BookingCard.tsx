import { useState } from "react";
import type { Booking } from "../../types/bookings";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

export interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
}

function BookingCard({ booking, onCancel }: BookingCardProps) {
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const { token } = useAuth();

  const handleCancel = async () => {
    if (isCancelling || booking.status === "cancelled") return;

    setIsCancelling(true);
    setError("");

    try {
      await apiFetch(`/booking/${booking._id}/cancel`, token, {
        method: "POST",
      });

      onCancel(booking._id);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <article
      className={`booking-card customer-booking-card ${
        booking.status === "cancelled" ? "booking-cancelled" : ""
      }`}
    >
      <div className="booking-card-header">
        <div>
          <h2>{booking.resource.name}</h2>

          <p className="booking-resource-type">
            {booking.resource.type.replace("_", " ")}
          </p>
        </div>

        <span className={`booking-status ${booking.status}`}>
          {booking.status}
        </span>
      </div>

      <div className="booking-info">
        <div>
          <span>Start</span>
          <strong>{formatDateTime(booking.startTime)}</strong>
        </div>

        <div>
          <span>End</span>
          <strong>{formatDateTime(booking.endTime)}</strong>
        </div>
      </div>

      <div className="booking-total">
        <span>Total</span>
        <strong>Rs. {booking.totalPrice}</strong>
      </div>

      {error && (
        <div className="booking-error">
          <p>{error}</p>
        </div>
      )}

      <div className="booking-card-actions">
        <button
          className="danger-button"
          onClick={handleCancel}
          disabled={isCancelling || booking.status === "cancelled"}
        >
          {isCancelling
            ? "Cancelling..."
            : booking.status === "cancelled"
              ? "Cancelled"
              : "Cancel Booking"}
        </button>
      </div>
    </article>
  );
}

export { BookingCard };
