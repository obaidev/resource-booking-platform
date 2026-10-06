import { useNavigate } from "react-router-dom";
import type { Resource } from "../../types/resource";

interface OwnerResourceCardProps {
  resource: Resource;
  onDelete: (id: string) => void;
}

function OwnerResourceCard({ resource, onDelete }: OwnerResourceCardProps) {
  const navigate = useNavigate();

  return (
    <article className="resource-card owner-resource-card">
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
          <span>{resource.capacity}</span>
        </p>

        <p>
          <strong>Hourly</strong>
          <span>Rs. {resource.hourlyPrice}</span>
        </p>

        <p>
          <strong>Daily</strong>
          <span>Rs. {resource.dailyPrice ?? "N/A"}</span>
        </p>
      </div>

      <div className="resource-actions">
        <button
          className="secondary-button"
          onClick={() => navigate(`/edit-resource/${resource._id}`)}
        >
          Edit
        </button>

        <button
          className="danger-button"
          onClick={() => onDelete(resource._id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default OwnerResourceCard;
