import { useState } from "react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function CreateWorkspace() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { token } = useAuth();

  const handleCreateWorkspace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    const workspaceData = {
      name,
      address,
      description,
      operatingHours: {
        open: openingTime,
        close: closingTime,
      },
    };

    try {
      await apiFetch("/workspaces", token, {
        method: "POST",
        body: JSON.stringify(workspaceData),
      });

      navigate("/my-workspaces");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create workspace");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="form-page">
      <div className="form-card">
        <div className="form-header">
          <h1>Create Workspace</h1>
          <p>
            Add a workspace where you can manage desks, meeting rooms, and other
            resources.
          </p>
        </div>

        <form onSubmit={handleCreateWorkspace} className="workspace-form">
          <div className="form-group">
            <label htmlFor="workspace-name">Workspace name</label>

            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Islamabad Coworking Hub"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workspace-address">Address</label>

            <input
              id="workspace-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Blue Area, Islamabad"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workspace-description">
              Description <span className="optional-label">(optional)</span>
            </label>

            <textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your workspace..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="opening-time">Opening time</label>

              <input
                id="opening-time"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="closing-time">Closing time</label>

              <input
                id="closing-time"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="form-error-message">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/my-workspaces")}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateWorkspace;
