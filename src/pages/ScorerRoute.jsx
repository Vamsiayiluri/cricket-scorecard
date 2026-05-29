/* eslint-disable react/prop-types */
import { useAuth } from "../context/AuthContext";
import AuthLoadingScreen from "../components/auth/AuthLoadingScreen";
import UnauthorizedState from "../components/auth/UnauthorizedState";
import ProtectedRoute from "./ProtectedRoute";

/**
 * Scorer/admin-only routes (create match, scoring, match editing).
 */
const ScorerRoute = ({ children }) => {
  const { isScorer, authLoading, profileLoading } = useAuth();

  return (
    <ProtectedRoute>
      {authLoading || profileLoading ? (
        <AuthLoadingScreen text="Checking permissions..." />
      ) : isScorer ? (
        children
      ) : (
        <UnauthorizedState
          title="Scorer access required"
          message="Only scorers and admins can manage matches and live scoring."
        />
      )}
    </ProtectedRoute>
  );
};

export default ScorerRoute;
