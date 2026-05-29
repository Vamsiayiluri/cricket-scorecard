import { useParams } from "react-router-dom";
import { Stack, Typography, Paper } from "@mui/material";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import StatusBadge from "../components/ui/StatusBadge";
import PublicMatchScorecard from "../components/viewer/PublicMatchScorecard";
import LiveScoreboard from "../components/viewer/LiveScoreboard";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import { useAuth } from "../context/AuthContext";
import { getMatchResultHeadline, getMatchTitle, isCompletedMatch } from "../utils/matchDisplay";
import { MATCH_STATUS } from "../services/firebase/constants";

/**
 * Public read-only full scorecard page.
 */
const PublicScorecardPage = () => {
  const { matchId } = useParams();
  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const { authLoading, isAuthenticated } = useAuth();

  if (!matchId) {
    return (
      <PageContainer>
        <ErrorState message="Invalid scorecard link." />
      </PageContainer>
    );
  }

  if (loading || authLoading) {
    return (
      <PageContainer title="Scorecard">
        <PageLoading text="Loading scorecard..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Scorecard">
        <ErrorState message={error.message || "Unable to load scorecard."} />
      </PageContainer>
    );
  }

  if (match && match.isPublic === false && !isAuthenticated) {
    return (
      <PageContainer title="Scorecard">
        <ErrorState message="This scorecard is not publicly available." />
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer title="Scorecard">
        <ErrorState message="Match not found." />
      </PageContainer>
    );
  }

  const completed = isCompletedMatch(match);
  const displayStatus = completed ? MATCH_STATUS.COMPLETED : match.status;
  const subtitle = completed ? getMatchResultHeadline(match) : "Full match scorecard - read only";

  return (
    <PageContainer title={getMatchTitle(match)} subtitle={subtitle}>
      <Stack spacing={2}>
        <Paper sx={{ p: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Premium public scorecard view with innings progression and detailed batting/bowling tables.
          </Typography>
        </Paper>
        <StatusBadge status={displayStatus} />
        <LiveScoreboard match={match} loading={false} />
        <Typography variant="h3">Full Scorecard</Typography>
        <PublicMatchScorecard match={match} loading={false} />
      </Stack>
    </PageContainer>
  );
};

export default PublicScorecardPage;
