import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../context/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role ?? "")) {
    return <Navigate to="/resources" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
