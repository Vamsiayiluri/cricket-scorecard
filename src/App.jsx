import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";
import ScorerRoute from "./pages/ScorerRoute";
import AppShell from "./layout/AppShell";
import { PageLoading } from "./components/ui/LoadingState";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MatchCreationPage = lazy(() => import("./pages/MatchCreationPage"));
const MatchScoring = lazy(() => import("./pages/MatchScoring"));
const Scorecard = lazy(() => import("./components/match/ScoreCard"));
const LiveMatchPage = lazy(() => import("./pages/LiveMatchPage"));
const PublicScorecardPage = lazy(() => import("./pages/PublicScorecardPage"));
const MatchDetailsPage = lazy(() => import("./pages/MatchDetailsPage"));
const EditMatchPage = lazy(() => import("./pages/EditMatchPage"));

const App = () => {
  return (
    <Router>
      <AppShell>
        <Suspense fallback={<PageLoading text="Loading page..." />}>
          <Routes>
            {/* Public viewer routes — no auth required */}
            <Route path="/live/:matchId" element={<LiveMatchPage />} />
            <Route path="/scorecard/:matchId" element={<PublicScorecardPage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated routes (scorers + viewers) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Scorer/admin-only routes */}
            <Route
              path="/matches/:matchId"
              element={
                <ProtectedRoute>
                  <MatchDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/matches/:matchId/edit"
              element={
                <ScorerRoute>
                  <EditMatchPage />
                </ScorerRoute>
              }
            />
            <Route
              path="/create-match"
              element={
                <ScorerRoute>
                  <MatchCreationPage />
                </ScorerRoute>
              }
            />
            <Route
              path="/start-match"
              element={
                <ScorerRoute>
                  <MatchScoring />
                </ScorerRoute>
              }
            />
            <Route
              path="/score-card"
              element={
                <ScorerRoute>
                  <Scorecard />
                </ScorerRoute>
              }
            />
            <Route
              path="/start-second-innings"
              element={
                <ScorerRoute>
                  <MatchScoring />
                </ScorerRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </Router>
  );
};

export default App;
