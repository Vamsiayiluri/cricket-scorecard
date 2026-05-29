import { useParams } from "react-router-dom";
import { Box, Stack, Typography, Paper, Chip } from "@mui/material";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import LiveScoreboard from "../components/viewer/LiveScoreboard";
import PublicMatchScorecard from "../components/viewer/PublicMatchScorecard";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import { useAuth } from "../context/AuthContext";

/**
 * Public read-only live match page. No scoring controls.
 */
const LiveMatchPage = () => {
  const { matchId } = useParams();
  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const { authLoading, isAuthenticated } = useAuth();

  if (!matchId) {
    return (
      <PageContainer>
        <ErrorState message="Invalid match link." />
      </PageContainer>
    );
  }

  if (loading || authLoading) {
    return (
      <PageContainer title="Live Match">
        <PageLoading text="Loading live score..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Live Match">
        <ErrorState message={error.message || "Unable to load live match."} />
      </PageContainer>
    );
  }

  if (match && match.isPublic === false && !isAuthenticated) {
    return (
      <PageContainer title="Live Match">
        <ErrorState message="This match is not publicly available." />
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer title="Live Match">
        <ErrorState message="Match not found." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Live Cricket Score" subtitle="Updates automatically as the match progresses.">
      <Stack spacing={2}>
        <Paper sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip size="small" color="error" label="LIVE" />
            <Typography variant="body2" color="text.secondary">
              Auto-refreshing scoreboard for fans and officials.
            </Typography>
          </Stack>
        </Paper>
        <LiveScoreboard match={match} loading={false} />
        <Typography variant="h3">Full Scorecard</Typography>
        <PublicMatchScorecard match={match} loading={false} />
        <Box sx={{ pt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Share this page: {window.location.href}
          </Typography>
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default LiveMatchPage;
