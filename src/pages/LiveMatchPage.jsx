import { useParams } from "react-router-dom";
import { Box, Chip, Stack, Tooltip, Typography, Paper } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import LiveScoreboard from "../components/viewer/LiveScoreboard";
import PublicMatchScorecard from "../components/viewer/PublicMatchScorecard";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import useFollowMatch from "../hooks/firebase/useFollowMatch";
import { useAuth } from "../context/AuthContext";

/**
 * Public read-only live match page. No scoring controls.
 */
const LiveMatchPage = () => {
  const { matchId } = useParams();
  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const { authLoading, isAuthenticated, user } = useAuth();
  const { isFollowing, toggleFollow, loading: followLoading } = useFollowMatch(
    user?.uid,
    matchId
  );

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
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Auto-refreshing scoreboard for fans and officials.
            </Typography>
            {isAuthenticated && (
              <Tooltip title={isFollowing ? "Unfollow this match" : "Follow for notifications"}>
                <Chip
                  size="small"
                  icon={isFollowing
                    ? <NotificationsActiveIcon sx={{ fontSize: "14px !important" }} />
                    : <NotificationsNoneIcon sx={{ fontSize: "14px !important" }} />
                  }
                  label={isFollowing ? "Following" : "Follow"}
                  onClick={toggleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "filled" : "outlined"}
                  sx={{
                    height: 26,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    bgcolor: isFollowing ? "rgba(108,99,255,0.12)" : "transparent",
                    color: isFollowing ? "primary.main" : "text.secondary",
                    borderColor: isFollowing ? "primary.main" : "divider",
                    "&:hover": { borderColor: "primary.main", color: "primary.main" },
                  }}
                />
              </Tooltip>
            )}
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
