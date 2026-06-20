import { useEffect, useMemo, useState } from "react";
import { Box, Chip, Grid, Paper, Stack, Typography } from "@mui/material";
import MatchOverviewCard from "../components/Dashboard/MatchOverviewCard";
import OngoingMatchesCard from "../components/Dashboard/OngoingMatchesCard";
import UpcomingMatchesCard from "../components/Dashboard/UpcomingMatchesCard";
import CompletedMatchesCard from "../components/Dashboard/CompletedMatchesCard";
import RecentActivityCard from "../components/Dashboard/RecentActivityCard";
import AppButton from "../components/ui/AppButton";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { useNavigate } from "react-router-dom";
import useDashboardMatches from "../hooks/firebase/useDashboardMatches";
import { useAuth } from "../context/AuthContext";
import { sendVerificationEmail } from "../services/firebase/authService";
import { getUserScorerRequest, requestScorerRole, REQUEST_STATUS } from "../services/firebase/scorerRequestService";
import { useToast } from "../context/ToastContext";
import AddIcon from "@mui/icons-material/Add";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isScorer, isViewer, user } = useAuth();
  const { showToast } = useToast();
  const { ongoing, upcoming, completed, recentActivity, stats, loading, error } =
    useDashboardMatches({ realtime: true });
  const [requesting, setRequesting] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [scorerRequest, setScorerRequest] = useState(null);

  const emailVerified = user?.emailVerified ?? false;

  // Matches the current scorer is actively scoring (in-progress, owned by them)
  const resumeMatches = useMemo(
    () => isScorer ? ongoing.filter(m => m.createdBy === user?.uid) : [],
    [ongoing, isScorer, user?.uid]
  );

  // Load existing scorer request for this viewer
  useEffect(() => {
    if (!isViewer || !user?.uid || isScorer) return;
    getUserScorerRequest(user.uid).then(setScorerRequest).catch(() => {});
  }, [isViewer, isScorer, user?.uid]);

  const handleResendVerification = async () => {
    if (!user || resendingVerification) return;
    setResendingVerification(true);
    try {
      await sendVerificationEmail(user);
      showToast("Verification email sent. Check your inbox.", "success");
    } catch {
      showToast("Could not send verification email. Please try again.", "error");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleRequestScorer = async () => {
    if (!user?.uid || requesting) return;
    setRequesting(true);
    try {
      await requestScorerRole({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      });
      setScorerRequest({ status: REQUEST_STATUS.PENDING });
      showToast("Request submitted. Admin will review it shortly.", "success");
    } catch {
      showToast("Could not submit request. Please try again.", "error");
    } finally {
      setRequesting(false);
    }
  };

  const hasAnyMatches = ongoing.length > 0 || upcoming.length > 0 || completed.length > 0;

  return (
    <PageContainer
      title="Dashboard"
      subtitle={
        isScorer
          ? "Manage your matches, teams, and tournaments."
          : "Browse live scores and recent match results."
      }
      action={
        isScorer ? (
          <AppButton
            startIcon={<AddIcon />}
            onClick={() => navigate("/create-match")}
            variant="contained"
            size="small"
          >
            Create Match
          </AppButton>
        ) : null
      }
    >
      {error && <ErrorState message={error.message || "Unable to load dashboard data."} />}

      {/* Resume Scoring — shown for scorers with active in-progress matches */}
      {resumeMatches.length > 0 && resumeMatches.map((m, idx) => {
        const inningIdx = (m.scoreCard?.currentInning ?? 1) - 1;
        const inning = m.scoreCard?.innings?.[inningIdx];
        const runs = inning?.runs ?? null;
        const wickets = inning?.wickets ?? null;
        const balls = inning?.balls ?? null;
        const overs = balls != null ? `${Math.floor(balls / 6)}.${balls % 6}` : null;
        const scoreStr = runs != null && wickets != null
          ? `${runs}/${wickets}${overs ? ` (${overs} ov)` : ""}`
          : null;
        return (
          <Paper
            key={m.matchId}
            variant="outlined"
            sx={{ mb: 2, p: 2, borderColor: "error.main", bgcolor: "rgba(239,68,68,0.04)", borderRadius: 2 }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PlayCircleOutlineIcon sx={{ color: "error.main", flexShrink: 0 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {idx === 0 && resumeMatches.length === 1
                      ? "Active match in progress"
                      : `Match ${idx + 1} of ${resumeMatches.length} in progress`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.matchDetails?.teamA} vs {m.matchDetails?.teamB}
                    {scoreStr && (
                      <Box component="span" sx={{ ml: 1, fontWeight: 700, color: "error.main" }}>
                        · {scoreStr}
                      </Box>
                    )}
                  </Typography>
                </Box>
              </Stack>
              <AppButton
                variant="contained"
                onClick={() => navigate(`/score-card?matchId=${m.matchId}`)}
                sx={{ flexShrink: 0, bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
              >
                Resume Scoring
              </AppButton>
            </Stack>
          </Paper>
        );
      })}

      {isViewer && !emailVerified && !isScorer && (
        <Paper
          variant="outlined"
          sx={{ mb: 2, p: 2, borderColor: "warning.main", bgcolor: "rgba(245,158,11,0.04)", borderRadius: 2 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <MarkEmailUnreadOutlinedIcon sx={{ color: "warning.main" }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>Verify your email to become a Scorer</Typography>
                <Typography variant="caption" color="text.secondary">
                  Check your inbox for a verification link. Didn&apos;t receive it?
                </Typography>
              </Box>
            </Stack>
            <AppButton
              variant="outlined"
              onClick={handleResendVerification}
              loading={resendingVerification}
              sx={{ flexShrink: 0, borderColor: "warning.main", color: "warning.main" }}
            >
              Resend Email
            </AppButton>
          </Stack>
        </Paper>
      )}

      {/* Pending request banner */}
      {isViewer && emailVerified && !isScorer && scorerRequest?.status === REQUEST_STATUS.PENDING && (
        <Paper
          variant="outlined"
          sx={{ mb: 2.5, p: 2, borderColor: "warning.main", bgcolor: "rgba(245,158,11,0.04)", borderRadius: 2 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <HourglassEmptyOutlinedIcon sx={{ color: "warning.main", flexShrink: 0 }} />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle2" fontWeight={700}>Scorer request pending</Typography>
                <Chip label="Pending" size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700, fontSize: "0.7rem" }} />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Your request has been submitted. A scorer will review and approve it shortly.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Rejected request banner */}
      {isViewer && emailVerified && !isScorer && scorerRequest?.status === REQUEST_STATUS.REJECTED && (
        <Paper
          variant="outlined"
          sx={{ mb: 2.5, p: 2, borderColor: "error.main", bgcolor: "rgba(239,68,68,0.04)", borderRadius: 2 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CancelOutlinedIcon sx={{ color: "error.main", flexShrink: 0 }} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700}>Scorer request not approved</Typography>
                  <Chip label="Rejected" size="small" sx={{ bgcolor: "rgba(239,68,68,0.12)", color: "error.main", fontWeight: 700, fontSize: "0.7rem" }} />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Your previous request was not approved. You can submit a new request.
                </Typography>
              </Box>
            </Stack>
            <AppButton
              variant="outlined"
              onClick={handleRequestScorer}
              loading={requesting}
              sx={{ flexShrink: 0, borderColor: "error.main", color: "error.main" }}
            >
              Request Again
            </AppButton>
          </Stack>
        </Paper>
      )}

      {/* No request yet — show Become a Scorer CTA */}
      {isViewer && emailVerified && !isScorer && !scorerRequest && (
        <Paper
          variant="outlined"
          sx={{ mb: 2.5, p: 2, borderColor: "primary.main", bgcolor: "rgba(108,99,255,0.04)", borderRadius: 2 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SportsCricketIcon sx={{ color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Want to score matches and manage tournaments?
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Request scorer access — Admin will approve your request.
                </Typography>
              </Box>
            </Stack>
            <AppButton
              variant="contained"
              onClick={handleRequestScorer}
              loading={requesting}
              sx={{ flexShrink: 0 }}
            >
              Become a Scorer
            </AppButton>
          </Stack>
        </Paper>
      )}

      {(!isScorer || hasAnyMatches || loading) && (
        <>
          <Grid container spacing={2} className="animate-fade-in">
            <Grid item xs={12}>
              <MatchOverviewCard stats={stats} loading={loading} />
            </Grid>
            <Grid item xs={12} md={6}>
              <OngoingMatchesCard matches={ongoing} loading={loading} />
            </Grid>
            <Grid item xs={12} md={6}>
              <UpcomingMatchesCard matches={upcoming} loading={loading} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <CompletedMatchesCard matches={completed} loading={loading} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <RecentActivityCard matches={recentActivity} loading={loading} />
            </Grid>
          </Grid>

          {isScorer && (
            <Box sx={{ textAlign: "center", mt: 2.5 }}>
              <AppButton
                onClick={() => navigate("/create-match")}
                startIcon={<AddIcon />}
                aria-label="Create a new match"
                sx={{
                  py: 1,
                  width: "100%",
                  maxWidth: 380,
                  fontSize: "0.85rem",
                  background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
                  boxShadow: "0 4px 12px rgba(108, 99, 255, 0.2)",
                }}
              >
                Create Match
              </AppButton>
            </Box>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default DashboardPage;
