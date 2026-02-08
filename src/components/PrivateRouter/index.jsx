import { Navigate, Outlet, useLocation } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const storedRole = localStorage.getItem("role");

  // Normalize role names (support both underscore and dash formats)
  const normalizeRole = (role) => {
    if (!role) return null;
    return role.replace(/_/g, "-");
  };

  const normalizedStoredRole = normalizeRole(storedRole);
  const normalizedRequiredRole = normalizeRole(requiredRole);

  if (!storedRole || (requiredRole && normalizedStoredRole !== normalizedRequiredRole)) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
