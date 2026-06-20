import { useMemo, useState } from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
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
import { upgradeToScorer } from "../services/firebase/userService";
import { sendVerificationEmail } from "../services/firebase/authService";
import { useToast } from "../context/ToastContext";
import AddIcon from "@mui/icons-material/Add";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { isScorer, isViewer, user } = useAuth();
  const { showToast } = useToast();
  const { ongoing, upcoming, completed, recentActivity, stats, loading, error } =
    useDashboardMatches({ realtime: true });
  const [upgrading, setUpgrading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const emailVerified = user?.emailVerified ?? false;

  // Matches the current scorer is actively scoring (in-progress, owned by them)
  const resumeMatches = useMemo(
    () => isScorer ? ongoing.filter(m => m.createdBy === user?.uid) : [],
    [ongoing, isScorer, user?.uid]
  );

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

  const handleBecomeScorer = async () => {
    if (!user?.uid || upgrading) return;
    if (!emailVerified) {
      showToast("Please verify your email before becoming a Scorer.", "warning");
      return;
    }
    setUpgrading(true);
    try {
      await upgradeToScorer(user.uid);
      showToast("You're now a Scorer! Refresh if the menu doesn't update.", "success");
    } catch {
      showToast("Could not upgrade role. Please try again.", "error");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <PageContainer
      title="Match Operations Hub"
      subtitle={
        isScorer
          ? "Create, manage, and livestream professional-grade cricket scorecards."
          : "Browse live scoreboards, match summaries, and analytics tickers."
      }
    >
      {error && <ErrorState message={error.message || "Unable to load dashboard data."} />}

      {/* Resume Scoring — shown for scorers with an active in-progress match */}
      {resumeMatches.length > 0 && (
        <Paper
          variant="outlined"
          sx={{ mb: 2, p: 2, borderColor: "error.main", bgcolor: "rgba(239,68,68,0.04)", borderRadius: 2 }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PlayCircleOutlineIcon sx={{ color: "error.main" }} />
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  You have an active match in progress
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {resumeMatches[0].matchDetails?.teamA} vs {resumeMatches[0].matchDetails?.teamB}
                  {resumeMatches.length > 1 && ` · +${resumeMatches.length - 1} more`}
                </Typography>
              </Box>
            </Stack>
            <AppButton
              variant="contained"
              onClick={() => navigate(`/score-card?matchId=${resumeMatches[0].matchId}`)}
              sx={{ flexShrink: 0, bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
            >
              Resume Scoring
            </AppButton>
          </Stack>
        </Paper>
      )}

      {isViewer && !emailVerified && (
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

      {isViewer && emailVerified && (
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
                  Upgrade your account to Scorer — it&apos;s free and instant.
                </Typography>
              </Box>
            </Stack>
            <AppButton
              variant="contained"
              onClick={handleBecomeScorer}
              loading={upgrading}
              sx={{ flexShrink: 0 }}
            >
              Become a Scorer
            </AppButton>
          </Stack>
        </Paper>
      )}

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
    </PageContainer>
  );
};

export default DashboardPage;
