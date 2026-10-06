import { useEffect, useState } from "react";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

interface DashboardStats {
  totalUsers: number;
  totalWorkspaces: number;
  totalResources: number;
  totalBookings: number;
}

function AdminDashboardPage() {
  const { token } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch("/admin/dashboard", token);

        setStats(data.stats);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <main className="admin-page">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of your booking platform.</p>
        </div>

        <div className="admin-stats-grid">
          {[1, 2, 3, 4].map((item) => (
            <div className="admin-stat-card admin-skeleton-card" key={item}>
              <div className="admin-skeleton admin-skeleton-title" />
              <div className="admin-skeleton admin-skeleton-number" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-page">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Overview of your booking platform.</p>
        </div>

        <div className="admin-error" role="alert">
          {error}
        </div>
      </main>
    );
  }

  if (!stats) {
    return (
      <main className="admin-page">
        <div className="admin-empty-state">
          <h2>No dashboard data</h2>
          <p>Dashboard statistics are currently unavailable.</p>
        </div>
      </main>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
    },
    {
      title: "Total Workspaces",
      value: stats.totalWorkspaces,
      description: "Active platform spaces",
    },
    {
      title: "Total Resources",
      value: stats.totalResources,
      description: "Desks and rooms",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      description: "All booking records",
    },
  ];

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Overview of your booking platform.</p>
        </div>
      </div>

      <section className="admin-stats-grid">
        {statCards.map((card) => (
          <article className="admin-stat-card" key={card.title}>
            <div>
              <p className="admin-stat-title">{card.title}</p>
              <p className="admin-stat-description">{card.description}</p>
            </div>

            <p className="admin-stat-value">{card.value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminDashboardPage;
