import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/api";

function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/auth/register", undefined, {
        method: "POST",

        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="form-page auth-page">
      <div className="form-card auth-card">
        <div className="form-header">
          <h1>Create your account</h1>
          <p>
            Register to book workspace resources or manage your own workspace.
          </p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="register-name">Name</label>

            <input
              id="register-name"
              type="text"
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>

            <input
              id="register-email"
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
            <label htmlFor="register-password">Password</label>

            <input
              id="register-password"
              type="password"
              value={password}
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-role">Account type</label>

            <select
              id="register-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
            >
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
            </select>

            <span className="form-help-text">
              Customers book resources. Owners manage workspaces and resources.
            </span>
          </div>

          {error && (
            <div className="form-error-message" role="alert">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="form-success-message" role="status">
              <p>{success}</p>
            </div>
          )}

          <div className="form-actions auth-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}

export default RegistrationForm;
