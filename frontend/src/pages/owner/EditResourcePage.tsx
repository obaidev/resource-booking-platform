import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function EditResource() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "desk",
    capacity: "",
    hourlyPrice: "",
    dailyPrice: "",
  });

  useEffect(() => {
    if (!token) return;

    const fetchResource = async () => {
      try {
        const data = await apiFetch(`/resources/${id}`, token);

        setFormData({
          name: data.resource.name,
          type: data.resource.type,
          capacity: String(data.resource.capacity),
          hourlyPrice: String(data.resource.hourlyPrice),
          dailyPrice:
            data.resource.dailyPrice !== undefined &&
            data.resource.dailyPrice !== null
              ? String(data.resource.dailyPrice)
              : "",
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load resource.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResource();
  }, [id, token]);

  const handleUpdateResource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isUpdating) return;

    setIsUpdating(true);
    setError("");

    try {
      await apiFetch(`/resources/${id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          capacity: Number(formData.capacity),
          hourlyPrice: Number(formData.hourlyPrice),
          dailyPrice: formData.dailyPrice
            ? Number(formData.dailyPrice)
            : undefined,
        }),
      });

      navigate("/my-resources");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to update resource.");
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
            <h1>Edit Resource</h1>
            <p>Loading resource details...</p>
          </div>

          <div className="state-message">
            <p>Loading resource...</p>
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
            <h1>Edit Resource</h1>
            <p>Unable to load resource details.</p>
          </div>

          <div className="state-message error-message">
            <p>{error}</p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/my-resources")}
            >
              Back to Resources
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
          <h1>Edit Resource</h1>
          <p>Update the details and pricing for this resource.</p>
        </div>

        <form onSubmit={handleUpdateResource} className="resource-form">
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
              required
              disabled={isUpdating}
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
              required
              disabled={isUpdating}
            >
              <option value="desk">Desk</option>
              <option value="meeting_room">Meeting Room</option>
              <option value="private_office">Private Office</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>

              <input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    capacity: e.target.value,
                  })
                }
                placeholder="e.g. 4"
                min="1"
                required
                disabled={isUpdating}
              />
            </div>

            <div className="form-group">
              <label htmlFor="hourly-price">Hourly price</label>

              <input
                id="hourly-price"
                type="number"
                value={formData.hourlyPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hourlyPrice: e.target.value,
                  })
                }
                placeholder="e.g. 500"
                min="0"
                required
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="daily-price">Daily price</label>

            <input
              id="daily-price"
              type="number"
              value={formData.dailyPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dailyPrice: e.target.value,
                })
              }
              placeholder="e.g. 3000"
              min="0"
              disabled={isUpdating}
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
              disabled={isUpdating}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Resource"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EditResource;
