import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthenticatedRoute = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  if (typeof children === 'function') {
    return children({ isAuthenticated, role });
  }

  // Nếu component cần authentication
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AuthenticatedRoute;
