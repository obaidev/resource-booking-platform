import { useNavigate } from "react-router-dom";
import type { Resource } from "../../types/resource";

interface ResourceCardProps {
  resource: Resource;
}

function ResourceCard({ resource }: ResourceCardProps) {
  const navigate = useNavigate();

  const handleBooking = () => {
    navigate("/booking", {
      state: resource,
    });
  };

  return (
    <article className="resource-card customer-resource-card">
      <div className="resource-card-header">
        <div>
          <h2>{resource.name}</h2>

          <span className="resource-type">
            {resource.type.replace("_", " ")}
          </span>
        </div>

        <span className={`resource-status ${resource.status}`}>
          {resource.status}
        </span>
      </div>

      <div className="resource-details">
        <p>
          <strong>Capacity</strong>
          <span>{resource.capacity} people</span>
        </p>

        <p>
          <strong>Hourly</strong>
          <span>Rs. {resource.hourlyPrice}</span>
        </p>

        <p>
          <strong>Daily</strong>
          <span>
            {resource.dailyPrice !== undefined
              ? `Rs. ${resource.dailyPrice}`
              : "N/A"}
          </span>
        </p>
      </div>

      <div className="resource-card-footer">
        <button
          className="primary-button"
          onClick={handleBooking}
          disabled={resource.status !== "active"}
        >
          {resource.status === "active" ? "Book Now" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

export default ResourceCard;
