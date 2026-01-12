import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const AuthenticatedRoute = ({ children }) => {
  const location = useLocation();
  const { token, role } = useSelector((state) => state.auth);
  // Check both Redux state and localStorage as fallback
  const tokenFromRedux = token;
  const tokenFromStorage = localStorage.getItem("token");
  const isAuthenticated = !!(tokenFromRedux || tokenFromStorage);

  if (typeof children === 'function') {
    return children({ isAuthenticated, role });
  }

  // Nếu component cần authentication
  if (!isAuthenticated) {
    // Redirect to login and save the location they were trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthenticatedRoute;
