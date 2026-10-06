import type { OwnerBooking } from "../../types/bookings";

interface OwnerBookingCardProps {
  booking: OwnerBooking;
}

function OwnerBookingCard({ booking }: OwnerBookingCardProps) {
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
    <article className="owner-booking-card">
      <div className="owner-booking-header">
        <div>
          <h2>{booking.resource.name}</h2>
          <p>{booking.resource.type.replace("_", " ")}</p>
        </div>

        <span className={`booking-status ${booking.status}`}>
          {booking.status}
        </span>
      </div>

      <div className="booking-customer">
        <span className="booking-section-label">Customer</span>

        <strong>{booking.user.name}</strong>

        <span>{booking.user.email}</span>
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

      <div className="owner-booking-total">
        <span>Total</span>
        <strong>Rs. {booking.totalPrice}</strong>
      </div>
    </article>
  );
}

export default OwnerBookingCard;
