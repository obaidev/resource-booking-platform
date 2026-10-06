import { useEffect, useState } from "react";
import type { Workspace } from "../../types/workspace";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import WorkspaceCard from "../../components/owner/WorkspaceCard";
import { apiFetch } from "../../api/api";

function MyWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError("Failed to load workspaces.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [token]);

  const handleDeleteWorkspace = (id: string) => {
    setWorkspaces((current) =>
      current.filter((workspace) => workspace._id !== id),
    );
  };

  if (isLoading) {
    return (
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1>My Workspaces</h1>
            <p>Manage your workspaces and their resources.</p>
          </div>
        </div>

        <div className="state-message">
          <p>Loading workspaces...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-container">
        <div className="page-header">
          <div>
            <h1>My Workspaces</h1>
            <p>Manage your workspaces and their resources.</p>
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
          <h1>My Workspaces</h1>
          <p>Manage your workspaces and their resources.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/create-workspace")}
        >
          Create Workspace
        </button>
      </div>

      {workspaces.length === 0 ? (
        <div className="empty-state">
          <h2>No workspaces yet</h2>
          <p>Create your first workspace to start adding resources.</p>

          <button
            className="primary-button"
            onClick={() => navigate("/create-workspace")}
          >
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="workspace-grid">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace._id}
              workspace={workspace}
              onDelete={handleDeleteWorkspace}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default MyWorkspaces;
