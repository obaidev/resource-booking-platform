import { useEffect, useState } from "react";
import ResourceCard from "../../components/customer/ResourceCard";
import type { Resource, ResourcesResponse } from "../../types/resource";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = (await apiFetch("/resources", token)) as ResourcesResponse;

        setResources(data.resources);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load resources.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [token]);

  if (isLoading) {
    return (
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1>Available Resources</h1>
            <p>Find a workspace resource that fits your needs.</p>
          </div>
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
          <div>
            <h1>Available Resources</h1>
            <p>Find a workspace resource that fits your needs.</p>
          </div>
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
          <h1>Available Resources</h1>
          <p>Find a desk, meeting room, or private office to book.</p>
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="empty-state">
          <h2>No resources available</h2>
          <p>There are currently no active resources available for booking.</p>
        </div>
      ) : (
        <div className="resources-grid">
          {resources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </div>
      )}
    </main>
  );
}

export default ResourcesPage;
