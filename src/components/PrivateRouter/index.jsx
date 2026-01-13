import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const storedRole = localStorage.getItem("role");

  // Normalize role names (support both underscore and dash formats)
  const normalizeRole = (role) => {
    if (!role) return null;
    // Convert warehouse_staff <-> warehouse-staff, etc.
    return role.replace(/_/g, "-");
  };

  const normalizedStoredRole = normalizeRole(storedRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  if (!storedRole || (requiredRole && normalizedStoredRole !== normalizedRequiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
