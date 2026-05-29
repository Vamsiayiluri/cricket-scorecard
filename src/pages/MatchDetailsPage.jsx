import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, Chip, Divider } from "@mui/material";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import AppButton from "../components/ui/AppButton";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import { useAuth } from "../context/AuthContext";
import ShareMatchDialog from "../components/match/ShareMatchDialog";
import { formatMatchDate, getMatchRoute, getMatchTitle } from "../utils/matchDisplay";
import { archiveMatch, setMatchVisibility } from "../services/firebase/matchService";
import { useToast } from "../context/ToastContext";

const MatchDetailsPage = () => {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isScorer } = useAuth();
  const { showToast } = useToast();

  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const [shareOpen, setShareOpen] = useState(false);
  const openShareFromQuery = searchParams.get("share") === "1";

  useEffect(() => {
    if (openShareFromQuery) {
      setShareOpen(true);
    }
  }, [openShareFromQuery]);

  const title = useMemo(() => (match ? getMatchTitle(match) : "Match"), [match]);

  const handleToggleVisibility = async () => {
    if (!matchId || !match) return;
    try {
      await setMatchVisibility(matchId, !(match.isPublic ?? true));
      showToast(`Match is now ${(match.isPublic ?? true) ? "private" : "public"}`, "success");
    } catch {
      showToast("Unable to update visibility", "error");
    }
  };

  const handleArchive = async () => {
    if (!matchId) return;
    const confirmed = window.confirm("Archive this match? It will be hidden from default lists.");
    if (!confirmed) return;
    try {
      await archiveMatch(matchId);
      showToast("Match archived", "success");
      navigate("/dashboard");
    } catch {
      showToast("Unable to archive match", "error");
    }
  };

  if (!matchId) {
    return (
      <PageContainer title="Match details">
        <ErrorState message="Invalid match id." />
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer title="Match details">
        <PageLoading text="Loading match..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Match details">
        <ErrorState message={error.message || "Unable to load match."} />
      </PageContainer>
    );
  }

  if (!match) {
    return (
      <PageContainer title="Match details">
        <ErrorState message="Match not found." />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={title} subtitle="Match control center (pre-match + operational actions).">
      <Stack spacing={2} sx={{ maxWidth: 960 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
            <Box>
              <Typography variant="h3">{match.matchDetails?.title || title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {match.matchDetails?.location || "Venue TBD"} · {formatMatchDate(match.matchDetails?.date)}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                <Chip size="small" label={match.status || "unknown"} variant="outlined" />
                <Chip
                  size="small"
                  label={match.isPublic === false ? "Private" : "Public"}
                  variant="outlined"
                  color={match.isPublic === false ? "warning" : "success"}
                />
                {match.archivedAt && <Chip size="small" label="Archived" variant="outlined" />}
              </Stack>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
              <AppButton variant="outlined" onClick={() => navigate(getMatchRoute(match, { isScorer: false }))}>
                View Scorecard
              </AppButton>
              <AppButton variant="outlined" onClick={() => setShareOpen(true)}>
                Share
              </AppButton>
              {isScorer && (
                <AppButton
                  variant="outlined"
                  onClick={() => navigate(`/matches/${matchId}/edit`)}
                  disabled={match.status !== "scheduled"}
                >
                  Edit (pre-match)
                </AppButton>
              )}
              {isScorer && (
                <AppButton variant="outlined" onClick={handleToggleVisibility}>
                  {match.isPublic === false ? "Make public" : "Make private"}
                </AppButton>
              )}
              {isScorer && (
                <AppButton variant="outlined" color="warning" onClick={handleArchive}>
                  Archive
                </AppButton>
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={0.75}>
            <Typography variant="body2">
              Overs: {match.scoringRules?.maxOvers ?? "—"} · Match type: {match.matchDetails?.matchType ?? "—"}
            </Typography>
            <Typography variant="body2">
              Toss: {match.tossDetails?.winner ? `${match.tossDetails.winner} chose to ${String(match.tossDetails.decision).toLowerCase()}` : "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Notes: {match.notes?.trim() ? match.notes : "—"}
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      <ShareMatchDialog open={shareOpen} onClose={() => setShareOpen(false)} matchId={matchId} title={title} />
    </PageContainer>
  );
};

export default MatchDetailsPage;

