import { Suspense, useState } from "react";
import StartMatch from "../components/match/StartMatch";
import { useNavigate, useSearchParams } from "react-router-dom";
import { updateMatchById } from "../services/firebase/matchService";
import { trackMatchStarted } from "../services/analytics/analyticsService";
import { Paper, Typography } from "@mui/material";
import { PageLoading } from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../context/ToastContext";
import PageContainer from "../components/ui/PageContainer";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import { useAuth } from "../context/AuthContext";
import { createNotificationsForFollowers } from "../services/firebase/notificationService";
import { getMatchTitle } from "../utils/matchDisplay";

const MatchScoring = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const [isStarting, setIsStarting] = useState(false);

  const { data: matchData, loading, error } = useLiveMatch(matchId, {
    enabled: Boolean(matchId),
  });

  const startMatch = async (nextMatchData) => {
    if (isStarting) {
      return;
    }
    setIsStarting(true);
    try {
      await updateMatchById(nextMatchData);
      trackMatchStarted({ match_id: nextMatchData.matchId });
      // Fire-and-forget: notify followers that the match has started
      createNotificationsForFollowers(
        nextMatchData.matchId,
        getMatchTitle(nextMatchData),
        "match_started",
        user?.uid
      ).catch(() => {});
      navigate(`/score-card?matchId=${nextMatchData.matchId}`);
    } catch {
      showToast("Unable to start match. Please try again.", "error");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <PageContainer title="Match Setup" subtitle="Choose opening players and bowler before innings starts.">
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          background:
            "linear-gradient(120deg, rgba(108,99,255,0.24) 0%, rgba(139,92,246,0.16) 50%, rgba(34,197,94,0.1) 100%)",
        }}
      >
        <Typography variant="h3">Pre-Match Console</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure opening batter pair and first bowler with a clean live-scoring workflow.
        </Typography>
      </Paper>
      {loading && <PageLoading text="Loading match details..." />}
      {error && <ErrorState message={error.message || "Failed to fetch match data."} />}
      {!matchId && !loading && <ErrorState message="Match id missing in URL." />}
      {matchData && (
        <Suspense fallback={<PageLoading text="Loading setup..." />}>
          <StartMatch matchData={matchData} onStart={startMatch} isStarting={isStarting} />
        </Suspense>
      )}
    </PageContainer>
  );
};

export default MatchScoring;
