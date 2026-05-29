/* eslint-disable react/prop-types */
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../components/auth/AuthLoadingScreen";
import UnauthorizedState from "../components/auth/UnauthorizedState";

/**
 * Requires authenticated session. Preserves intended destination for post-login redirect.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isEmailVerified, authLoading } = useAuth();
  const location = useLocation();
  const redirectPath = `${location.pathname}${location.search}`;

  if (authLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: redirectPath }} />;
  }

  if (!isEmailVerified) {
    return (
      <UnauthorizedState
        title="Email verification required"
        message="Please verify your email before continuing."
      />
    );
  }

  return children;
};

export default ProtectedRoute;
