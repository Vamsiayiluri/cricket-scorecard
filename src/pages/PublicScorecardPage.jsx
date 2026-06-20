import { useState } from "react";
import { useParams } from "react-router-dom";
import { Chip, Stack, Typography, Paper, Tooltip } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import StatusBadge from "../components/ui/StatusBadge";
import AppButton from "../components/ui/AppButton";
import PublicMatchScorecard from "../components/viewer/PublicMatchScorecard";
import LiveScoreboard from "../components/viewer/LiveScoreboard";
import ResultShareDialog from "../components/match/ResultShareDialog";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import useFollowMatch from "../hooks/firebase/useFollowMatch";
import { useAuth } from "../context/AuthContext";
import { getMatchResultHeadline, getMatchTitle, isCompletedMatch } from "../utils/matchDisplay";
import { MATCH_STATUS } from "../services/firebase/constants";

/**
 * Public read-only full scorecard page.
 */
const PublicScorecardPage = () => {
  const { matchId } = useParams();
  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const { authLoading, isAuthenticated, user } = useAuth();
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const { isFollowing, toggleFollow, loading: followLoading } = useFollowMatch(
    user?.uid,
    matchId
  );

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
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <StatusBadge status={displayStatus} />
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
          {completed && (
            <AppButton
              size="small"
              variant="outlined"
              onClick={() => setShareCardOpen(true)}
              sx={{ minHeight: 28, py: 0.25, px: 1.5, fontSize: "0.75rem" }}
            >
              Share Result Card
            </AppButton>
          )}
        </Stack>
        {match.notes?.trim() && (
          <Paper variant="outlined" sx={{ p: 1.5, borderColor: "divider" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", color: "text.secondary", display: "block", mb: 0.5 }}>
              Match Notes
            </Typography>
            <Typography variant="body2">{match.notes}</Typography>
          </Paper>
        )}
        <LiveScoreboard match={match} loading={false} />
        <Typography variant="h3">Full Scorecard</Typography>
        <PublicMatchScorecard match={match} loading={false} />
      </Stack>

      <ResultShareDialog
        open={shareCardOpen}
        onClose={() => setShareCardOpen(false)}
        match={match}
      />
    </PageContainer>
  );
};

export default PublicScorecardPage;
