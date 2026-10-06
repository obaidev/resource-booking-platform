import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type { Resource } from "../../types/resource";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function BookingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const resource = location.state as Resource | undefined;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const createDateTime = (date: Date, time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    const result = new Date(date);

    result.setHours(hours, minutes, 0, 0);

    return result;
  };

  const generateTimeSlots = (open: string, close: string) => {
    const slots: string[] = [];

    const [openHour, openMinute] = open.split(":").map(Number);
    const [closeHour, closeMinute] = close.split(":").map(Number);

    let currentMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    while (currentMinutes < closeMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const minutes = currentMinutes % 60;

      slots.push(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
      );

      currentMinutes += 60;
    }

    return slots;
  };

  const handleBooking = async () => {
    if (!selectedDate || !startTime || !endTime) {
      setMessage("Please select a date, start time, and end time.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    const startDateTime = createDateTime(selectedDate, startTime);
    const endDateTime = createDateTime(selectedDate, endTime);

    const bookingData = {
      resource: resource?._id,
      startTime: startDateTime,
      endTime: endDateTime,
    };

    try {
      const data = await apiFetch("/booking", token, {
        method: "POST",
        body: JSON.stringify(bookingData),
      });

      setMessage(data.message);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Booking failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!resource) {
    return (
      <main className="booking-page">
        <div className="state-message error-message">
          <p>Resource information is unavailable.</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/resources")}
          >
            Back to Resources
          </button>
        </div>
      </main>
    );
  }

  const operatingHours = resource.workspace?.operatingHours;

  if (!operatingHours) {
    return (
      <main className="booking-page">
        <div className="state-message error-message">
          <p>Workspace operating hours are unavailable for this resource.</p>

          <button
            className="secondary-button"
            onClick={() => navigate("/resources")}
          >
            Back to Resources
          </button>
        </div>
      </main>
    );
  }

  const timeSlots = generateTimeSlots(
    operatingHours.open,
    operatingHours.close,
  );

  return (
    <main className="booking-page">
      <div className="booking-form-card">
        <div className="booking-header">
          <div>
            <p className="booking-eyebrow">Book resource</p>

            <h1>{resource.name}</h1>

            <p className="booking-resource-type">
              {resource.type.replace("_", " ")}
            </p>
          </div>

          <span className={`resource-status ${resource.status}`}>
            {resource.status}
          </span>
        </div>

        <div className="booking-resource-summary">
          <div>
            <span>Capacity</span>
            <strong>{resource.capacity} people</strong>
          </div>

          <div>
            <span>Hourly rate</span>
            <strong>Rs. {resource.hourlyPrice}</strong>
          </div>
        </div>

        <section className="booking-section">
          <div className="booking-section-header">
            <h2>1. Select a date</h2>

            <span>
              {selectedDate ? formatDate(selectedDate) : "Choose a date"}
            </span>
          </div>

          <Calendar
            minDate={new Date()}
            onChange={(value) => {
              if (value instanceof Date) {
                setSelectedDate(value);
                setStartTime("");
                setEndTime("");
                setMessage("");
              }
            }}
            value={selectedDate}
          />
        </section>

        <section className="booking-section">
          <div className="booking-section-header">
            <h2>2. Select start time</h2>

            <span>{startTime || "Choose a start time"}</span>
          </div>

          <div className="time-slots">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-slot ${startTime === time ? "selected" : ""}`}
                onClick={() => {
                  setStartTime(time);
                  setEndTime("");
                  setMessage("");
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        <section className="booking-section">
          <div className="booking-section-header">
            <h2>3. Select end time</h2>

            <span>{endTime || "Choose an end time"}</span>
          </div>

          <div className="time-slots">
            {timeSlots.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-slot ${endTime === time ? "selected" : ""}`}
                onClick={() => {
                  setEndTime(time);
                  setMessage("");
                }}
                disabled={!startTime || time <= startTime}
              >
                {time}
              </button>
            ))}
          </div>
        </section>

        <div className="booking-summary">
          <div>
            <span>Date</span>

            <strong>
              {selectedDate ? formatDate(selectedDate) : "Not selected"}
            </strong>
          </div>

          <div>
            <span>Time</span>

            <strong>
              {startTime && endTime
                ? `${startTime} – ${endTime}`
                : "Not selected"}
            </strong>
          </div>
        </div>

        {message && (
          <div
            className={`booking-message ${
              message.toLowerCase().includes("success") ||
              message.toLowerCase().includes("booked")
                ? "success"
                : "error"
            }`}
          >
            <p>{message}</p>
          </div>
        )}

        <div className="booking-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/resources")}
            disabled={isLoading}
          >
            Back
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleBooking}
            disabled={isLoading || !selectedDate || !startTime || !endTime}
          >
            {isLoading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default BookingPage;
