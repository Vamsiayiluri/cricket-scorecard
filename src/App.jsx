import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";
import ScorerRoute from "./pages/ScorerRoute";
import AppShell from "./layout/AppShell";
import { PageLoading } from "./components/ui/LoadingState";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const BecomeScorerPage = lazy(() => import("./pages/BecomeScorerPage"));
const MatchCreationPage = lazy(() => import("./pages/MatchCreationPage"));
const MatchScoring = lazy(() => import("./pages/MatchScoring"));
const Scorecard = lazy(() => import("./components/match/ScoreCard"));
const LiveMatchPage = lazy(() => import("./pages/LiveMatchPage"));
const PublicScorecardPage = lazy(() => import("./pages/PublicScorecardPage"));
const MatchDetailsPage = lazy(() => import("./pages/MatchDetailsPage"));
const EditMatchPage = lazy(() => import("./pages/EditMatchPage"));
const TeamsPage = lazy(() => import("./pages/TeamsPage"));
const PlayersPage = lazy(() => import("./pages/PlayersPage"));
const PlayerProfilePage = lazy(() => import("./pages/PlayerProfilePage"));
const DiscoverPage = lazy(() => import("./pages/DiscoverPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const TournamentsPage = lazy(() => import("./pages/TournamentsPage"));
const TournamentDetailsPage = lazy(() => import("./pages/TournamentDetailsPage"));
const PublicTournamentPage = lazy(() => import("./pages/PublicTournamentPage"));
const ImportsPage = lazy(() => import("./pages/ImportsPage"));
const ImportHistoryPage = lazy(() => import("./pages/ImportHistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ScorerRequestsPage = lazy(() => import("./pages/ScorerRequestsPage"));

const App = () => {
  return (
    <Router>
      <AppShell>
        <Suspense fallback={<PageLoading text="Loading page..." />}>
          <Routes>
            {/* Public viewer routes — no auth required */}
            <Route path="/live/:matchId" element={<LiveMatchPage />} />
            <Route path="/scorecard/:matchId" element={<PublicScorecardPage />} />
            <Route path="/t/:tournamentId" element={<PublicTournamentPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/results" element={<DiscoverPage />} />

            {/* Notifications — authenticated users */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

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
            <Route
              path="/become-scorer"
              element={
                <ProtectedRoute>
                  <BecomeScorerPage />
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

            <Route
              path="/teams"
              element={
                <ScorerRoute>
                  <TeamsPage />
                </ScorerRoute>
              }
            />
            <Route
              path="/players"
              element={
                <ScorerRoute>
                  <PlayersPage />
                </ScorerRoute>
              }
            />
            <Route
              path="/players/:playerId"
              element={
                <ProtectedRoute>
                  <PlayerProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments"
              element={
                <ProtectedRoute>
                  <TournamentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournaments/:tournamentId"
              element={
                <ProtectedRoute>
                  <TournamentDetailsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/imports"
              element={
                <ScorerRoute>
                  <ImportsPage />
                </ScorerRoute>
              }
            />
            <Route
              path="/import-history"
              element={
                <ScorerRoute>
                  <ImportHistoryPage />
                </ScorerRoute>
              }
            />

            <Route
              path="/scorer-requests"
              element={
                <ScorerRoute>
                  <ScorerRequestsPage />
                </ScorerRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
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
