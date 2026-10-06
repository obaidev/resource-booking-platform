import { NavLink } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import useAuth from "../../context/useAuth";

function Navbar() {
  const { role, token } = useAuth();

  if (!token) {
    return null;
  }

  return (
    <nav>
      {role === "customer" && (
        <>
          <NavLink
            to="/resources"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Resources
          </NavLink>

          <NavLink
            to="/my-bookings"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            My Bookings
          </NavLink>
        </>
      )}

      {role === "owner" && (
        <>
          <NavLink
            to="/my-workspaces"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            My Workspaces
          </NavLink>

          <NavLink
            to="/my-resources"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            My Resources
          </NavLink>

          <NavLink
            to="/owner-bookings"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Bookings
          </NavLink>
        </>
      )}
      {role === "admin" && (
        <>
          <NavLink
            to="/admin"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            All Bookings
          </NavLink>
        </>
      )}

      <LogoutButton />
    </nav>
  );
}

export default Navbar;
