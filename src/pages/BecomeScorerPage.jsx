import { useEffect, useState } from "react";
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import AppButton from "../components/ui/AppButton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { sendVerificationEmail } from "../services/firebase/authService";
import {
  getUserScorerRequest,
  requestScorerRole,
  REQUEST_STATUS,
} from "../services/firebase/scorerRequestService";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const statusConfig = {
  [REQUEST_STATUS.PENDING]: {
    icon: <HourglassEmptyOutlinedIcon sx={{ color: "warning.main" }} />,
    label: "Pending",
    title: "Your scorer request is pending",
    message: "An admin will review your request. You can keep browsing matches while you wait.",
    color: "warning.main",
    bg: "rgba(245,158,11,0.05)",
  },
  [REQUEST_STATUS.APPROVED]: {
    icon: <CheckCircleOutlineIcon sx={{ color: "success.main" }} />,
    label: "Approved",
    title: "Your scorer access is approved",
    message: "You can now create matches, score live games, and manage your cricket data.",
    color: "success.main",
    bg: "rgba(34,197,94,0.05)",
  },
  [REQUEST_STATUS.REJECTED]: {
    icon: <CancelOutlinedIcon sx={{ color: "error.main" }} />,
    label: "Rejected",
    title: "Your previous request was not approved",
    message: "You can submit a new request if your access need has changed.",
    color: "error.main",
    bg: "rgba(239,68,68,0.05)",
  },
};

const BecomeScorerPage = () => {
  const navigate = useNavigate();
  const { isScorer, user } = useAuth();
  const { showToast } = useToast();
  const [requesting, setRequesting] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [scorerRequest, setScorerRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(true);

  const emailVerified = user?.emailVerified ?? false;
  const currentStatus = scorerRequest?.status;
  const status = statusConfig[currentStatus];
  const canSubmitRequest =
    !isScorer &&
    emailVerified &&
    (!scorerRequest || scorerRequest.status === REQUEST_STATUS.REJECTED);

  useEffect(() => {
    if (!user?.uid || isScorer) {
      setLoadingRequest(false);
      return;
    }

    let mounted = true;
    setLoadingRequest(true);
    getUserScorerRequest(user.uid)
      .then((request) => {
        if (mounted) setScorerRequest(request);
      })
      .catch(() => {
        if (mounted) showToast("Could not load scorer request status.", "error");
      })
      .finally(() => {
        if (mounted) setLoadingRequest(false);
      });

    return () => {
      mounted = false;
    };
  }, [isScorer, showToast, user?.uid]);

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
    if (!user?.uid || requesting || !canSubmitRequest) return;
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

  return (
    <PageContainer
      title="Become a Scorer"
      subtitle="Request access to create matches, score live games, and manage cricket data."
      action={
        isScorer ? (
          <AppButton onClick={() => navigate("/create-match")} size="small">
            Create Match
          </AppButton>
        ) : null
      }
    >
      <Stack spacing={2.5} sx={{ maxWidth: 960 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 2,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems={{ md: "center" }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(108,99,255,0.1)",
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <SportsCricketIcon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
                Score matches for your community
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Scorer access lets you create fixtures, run live scoring, update scorecards, and manage your own
                match data. Requests are reviewed before the role is granted.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {isScorer && (
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, borderColor: "success.main", bgcolor: "rgba(34,197,94,0.05)" }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutlineIcon sx={{ color: "success.main" }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    You already have scorer access
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    You can create matches and manage your scorer workspace now.
                  </Typography>
                </Box>
              </Stack>
              <AppButton onClick={() => navigate("/create-match")} sx={{ flexShrink: 0 }}>
                Create Match
              </AppButton>
            </Stack>
          </Paper>
        )}

        {!isScorer && !emailVerified && (
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, borderColor: "warning.main", bgcolor: "rgba(245,158,11,0.05)" }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <MarkEmailUnreadOutlinedIcon sx={{ color: "warning.main" }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Verify your email first
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Email verification is required before requesting scorer access.
                  </Typography>
                </Box>
              </Stack>
              <AppButton
                variant="outlined"
                loading={resendingVerification}
                onClick={handleResendVerification}
                sx={{ flexShrink: 0, borderColor: "warning.main", color: "warning.main" }}
              >
                Resend Email
              </AppButton>
            </Stack>
          </Paper>
        )}

        {!isScorer && emailVerified && status && (
          <Paper
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, borderColor: status.color, bgcolor: status.bg }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1.5} alignItems="center">
                {status.icon}
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={700}>
                      {status.title}
                    </Typography>
                    <Chip label={status.label} size="small" sx={{ fontWeight: 700 }} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {status.message}
                  </Typography>
                </Box>
              </Stack>
              {currentStatus === REQUEST_STATUS.REJECTED && (
                <AppButton onClick={handleRequestScorer} loading={requesting} sx={{ flexShrink: 0 }}>
                  Request Again
                </AppButton>
              )}
            </Stack>
          </Paper>
        )}

        {!isScorer && emailVerified && !status && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: "primary.main" }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Request scorer access
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Submit a request for an admin to review. You will see the request status here after submission.
                </Typography>
              </Box>
              <Divider />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Signed in as {user?.email || "your account"}
                </Typography>
                <AppButton onClick={handleRequestScorer} loading={requesting || loadingRequest} sx={{ flexShrink: 0 }}>
                  Submit Request
                </AppButton>
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>
    </PageContainer>
  );
};

export default BecomeScorerPage;
