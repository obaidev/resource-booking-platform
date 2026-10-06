import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { apiFetch } from "../../api/api";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", undefined, {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      login(data.token, data.user.role);

      if (data.user.role === "admin") {
        navigate("/admin/bookings");
      } else if (data.user.role === "owner") {
        navigate("/my-workspaces");
      } else {
        navigate("/resources");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="form-page auth-page">
      <div className="form-card auth-card">
        <div className="form-header">
          <h1>Welcome back</h1>
          <p>Sign in to manage your workspace bookings.</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email</label>

            <input
              id="login-email"
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <input
              id="login-password"
              type="password"
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="form-error-message" role="alert">
              <p>{error}</p>
            </div>
          )}

          <div className="form-actions auth-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <span>Don't have an account?</span>
          <Link to="/register">Create an account</Link>
        </div>
      </div>
    </main>
  );
}

export default LoginForm;
