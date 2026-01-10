import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const storedRole = localStorage.getItem("role");

  if (!storedRole || (requiredRole && storedRole !== requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
