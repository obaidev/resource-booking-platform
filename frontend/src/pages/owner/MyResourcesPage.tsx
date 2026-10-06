import { useState, useEffect } from "react";
import OwnerResourceCard from "../../components/owner/OwnerResourceCard";
import type { Resource } from "../../types/resource";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function MyResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await apiFetch("/resources", token);

        setResources(data.resources);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load resources");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [token]);

  const handleDeleteResource = async (id: string) => {
    try {
      await apiFetch(`/resources/${id}`, token, {
        method: "DELETE",
      });

      setResources((current) =>
        current.filter((resource) => resource._id !== id),
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete resource");
      }
    }
  };

  if (isLoading) {
    return (
      <main className="page-container">
        <div className="page-header">
          <h1>My Resources</h1>
        </div>

        <div className="state-message">
          <p>Loading resources...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="page-header">
          <h1>My Resources</h1>
        </div>

        <div className="state-message error-message">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="page-header">
        <div>
          <h1>My Resources</h1>
          <p>Manage the resources in your workspaces.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/create-resource")}
        >
          Add Resource
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="empty-state">
          <h2>No resources yet</h2>
          <p>Create your first resource to start accepting bookings.</p>

          <button
            className="primary-button"
            onClick={() => navigate("/create-resource")}
          >
            Create Resource
          </button>
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map((resource) => (
            <OwnerResourceCard
              key={resource._id}
              resource={resource}
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default MyResources;
