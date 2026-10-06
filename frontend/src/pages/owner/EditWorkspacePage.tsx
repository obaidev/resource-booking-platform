import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type React from "react";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function EditWorkspace() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    openingTime: "",
    closingTime: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchWorkspace = async () => {
      try {
        const data = await apiFetch(`/workspaces/${id}`, token);

        setFormData({
          name: data.workspace.name,
          address: data.workspace.address,
          description: data.workspace.description ?? "",
          openingTime: data.workspace.operatingHours.open,
          closingTime: data.workspace.operatingHours.close,
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load workspace");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspace();
  }, [id, token]);

  const handleUpdateWorkspace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isUpdating) return;

    setIsUpdating(true);
    setError("");

    const workspaceData = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      operatingHours: {
        open: formData.openingTime,
        close: formData.closingTime,
      },
    };

    try {
      await apiFetch(`/workspaces/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify(workspaceData),
      });

      navigate("/my-workspaces");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update workspace");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <main className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h1>Edit Workspace</h1>
            <p>Loading workspace details...</p>
          </div>

          <div className="state-message">
            <p>Loading workspace...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error && !formData.name) {
    return (
      <main className="form-page">
        <div className="form-card">
          <div className="form-header">
            <h1>Edit Workspace</h1>
            <p>Unable to load this workspace.</p>
          </div>

          <div className="state-message error-message">
            <p>{error}</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/my-workspaces")}
            >
              Back to Workspaces
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="form-page">
      <div className="form-card">
        <div className="form-header">
          <h1>Edit Workspace</h1>
          <p>Update the details and operating hours for your workspace.</p>
        </div>

        <form onSubmit={handleUpdateWorkspace} className="workspace-form">
          <div className="form-group">
            <label htmlFor="workspace-name">Workspace name</label>

            <input
              id="workspace-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Islamabad Coworking Hub"
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workspace-address">Address</label>

            <input
              id="workspace-address"
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              placeholder="e.g. Blue Area, Islamabad"
              required
              disabled={isUpdating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workspace-description">
              Description <span className="optional-label">(optional)</span>
            </label>

            <textarea
              id="workspace-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe your workspace..."
              rows={4}
              disabled={isUpdating}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="opening-time">Opening time</label>

              <input
                id="opening-time"
                type="time"
                value={formData.openingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingTime: e.target.value,
                  })
                }
                required
                disabled={isUpdating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="closing-time">Closing time</label>

              <input
                id="closing-time"
                type="time"
                value={formData.closingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    closingTime: e.target.value,
                  })
                }
                required
                disabled={isUpdating}
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
              disabled={isUpdating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Workspace"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditWorkspace;
