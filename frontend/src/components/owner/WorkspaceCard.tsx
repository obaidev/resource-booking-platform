import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Workspace } from "../../types/workspace";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

interface WorkspaceCardProps {
  workspace: Workspace;
  onDelete: (workspaceID: string) => void;
}

function WorkspaceCard({ workspace, onDelete }: WorkspaceCardProps) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleDelete = async () => {
    setError("");

    try {
      await apiFetch(`/workspaces/${workspace._id}`, token, {
        method: "DELETE",
      });

      onDelete(workspace._id);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <article className="workspace-card">
      <div className="workspace-card-header">
        <div>
          <h2>{workspace.name}</h2>
          <p className="workspace-address">{workspace.address}</p>
        </div>

        <span className={`workspace-status ${workspace.status}`}>
          {workspace.status}
        </span>
      </div>

      {workspace.description && (
        <p className="workspace-description">{workspace.description}</p>
      )}

      <div className="workspace-details">
        <div>
          <span>Operating hours</span>
          <strong>
            {workspace.operatingHours.open} - {workspace.operatingHours.close}
          </strong>
        </div>
      </div>

      {error && (
        <div className="workspace-error">
          <p>{error}</p>
        </div>
      )}

      <div className="workspace-actions">
        <button
          className="secondary-button"
          onClick={() => navigate(`/edit-workspace/${workspace._id}`)}
        >
          Edit
        </button>

        <button className="danger-button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

export default WorkspaceCard;
