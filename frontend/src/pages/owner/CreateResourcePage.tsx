import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Workspace } from "../../types/workspace";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function CreateResource() {
  const [isCreating, setIsCreating] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "desk",
    capacity: "",
    hourlyPrice: "",
    dailyPrice: "",
    workspace: "",
  });

  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const fetchWorkspaces = async () => {
      try {
        const data = await apiFetch("/workspaces", token);

        setWorkspaces(data.workspaces);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load workspaces");
        }
      }
    };

    fetchWorkspaces();
  }, [token]);

  const handleCreateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isCreating) return;

    setIsCreating(true);
    setError("");

    try {
      await apiFetch("/resources", token, {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          capacity: Number(formData.capacity),
          hourlyPrice: Number(formData.hourlyPrice),
          dailyPrice: Number(formData.dailyPrice),
          workspace: formData.workspace,
        }),
      });

      navigate("/my-resources");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create resource");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="form-page">
      <div className="form-card">
        <div className="form-header">
          <h1>Create Resource</h1>
          <p>Add a desk, meeting room, or private office to your workspace.</p>
        </div>

        <form onSubmit={handleCreateResource} className="resource-form">
          <div className="form-group">
            <label htmlFor="resource-name">Resource name</label>
            <input
              id="resource-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Desk A1"
              disabled={isCreating}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resource-type">Resource type</label>
            <select
              id="resource-type"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value,
                })
              }
              disabled={isCreating}
            >
              <option value="desk">Desk</option>
              <option value="meeting_room">Meeting Room</option>
              <option value="private_office">Private Office</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="workspace">Workspace</label>
            <select
              id="workspace"
              value={formData.workspace}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  workspace: e.target.value,
                })
              }
              disabled={isCreating}
            >
              <option value="">Select Workspace</option>

              {workspaces.map((workspace) => (
                <option key={workspace._id} value={workspace._id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: e.target.value,
                  })
                }
                placeholder="e.g. 4"
                disabled={isCreating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="hourly-price">Hourly price</label>
              <input
                id="hourly-price"
                type="number"
                min="0"
                value={formData.hourlyPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyPrice: e.target.value,
                  })
                }
                placeholder="e.g. 500"
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="daily-price">Daily price</label>
            <input
              id="daily-price"
              type="number"
              min="0"
              value={formData.dailyPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dailyPrice: e.target.value,
                })
              }
              placeholder="e.g. 3000"
              disabled={isCreating}
            />
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
              onClick={() => navigate("/my-resources")}
              disabled={isCreating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Resource"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default CreateResource;
