import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, Chip, Divider, Avatar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import PageContainer from "../components/ui/PageContainer";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import AppButton from "../components/ui/AppButton";
import useLiveMatch from "../hooks/firebase/useLiveMatch";
import { useAuth } from "../context/AuthContext";
import ShareMatchDialog from "../components/match/ShareMatchDialog";
import ResultShareDialog from "../components/match/ResultShareDialog";
import { formatMatchDate, getMatchRoute, getMatchTitle, isCompletedMatch } from "../utils/matchDisplay";
import { archiveMatch, setMatchVisibility } from "../services/firebase/matchService";
import { useToast } from "../context/ToastContext";
import {
  canAccessMatch,
  getMatchAccessRequests,
  getUserMatchAccessRequest,
  requestMatchAccess,
  approveMatchAccess,
  rejectMatchAccess,
  MATCH_ACCESS_STATUS,
} from "../services/firebase/matchAccessService";

const MatchDetailsPage = () => {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isScorer, user } = useAuth();
  const { showToast } = useToast();

  const { data: match, loading, error } = useLiveMatch(matchId, { enabled: Boolean(matchId) });
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCardOpen, setShareCardOpen] = useState(false);
  const openShareFromQuery = searchParams.get("share") === "1";

  // Access request state (for non-owner scorers)
  const [myAccessRequest, setMyAccessRequest] = useState(undefined);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Pending requests list (for match owner)
  const [accessRequests, setAccessRequests] = useState([]);
  const [actioningRequest, setActioningRequest] = useState(null);

  useEffect(() => {
    if (openShareFromQuery) setShareOpen(true);
  }, [openShareFromQuery]);

  const isOwner = Boolean(match && user?.uid && match.createdBy === user.uid);
  const hasAccess = Boolean(match && user?.uid && canAccessMatch(match, user.uid));

  // Non-owner scorer: load their own request once
  useEffect(() => {
    if (!match || !user?.uid || !isScorer || isOwner) return;
    getUserMatchAccessRequest(matchId, user.uid)
      .then(setMyAccessRequest)
      .catch(() => setMyAccessRequest(null));
  }, [match, user?.uid, isScorer, isOwner, matchId]);

  // Owner: load all access requests for this match
  useEffect(() => {
    if (!isOwner) return;
    getMatchAccessRequests(matchId).then(setAccessRequests).catch(() => {});
  }, [isOwner, matchId]);

  const handleRequestAccess = async () => {
    if (!matchId || !user?.uid || submittingRequest) return;
    setSubmittingRequest(true);
    try {
      const matchTitle = `${match?.matchDetails?.teamA || ""} vs ${match?.matchDetails?.teamB || ""}`;
      await requestMatchAccess({
        matchId,
        matchTitle,
        matchOwnerUid: match?.createdBy || "",
        requestedBy: user.uid,
        requestedByName: user.displayName || "",
        requestedByEmail: user.email || "",
      });
      setMyAccessRequest({ status: MATCH_ACCESS_STATUS.PENDING });
      showToast("Access request sent to the match owner.", "success");
    } catch {
      showToast("Could not send request. Please try again.", "error");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleApproveRequest = async (req) => {
    setActioningRequest(req.requestId);
    try {
      await approveMatchAccess(req.requestId, req.matchId, req.requestedBy, user.uid);
      setAccessRequests((prev) =>
        prev.map((r) => r.requestId === req.requestId ? { ...r, status: MATCH_ACCESS_STATUS.APPROVED } : r)
      );
      showToast(`${req.requestedByName || req.requestedByEmail} can now score this match.`, "success");
    } catch {
      showToast("Could not approve request.", "error");
    } finally {
      setActioningRequest(null);
    }
  };

  const handleRejectRequest = async (req) => {
    setActioningRequest(req.requestId);
    try {
      await rejectMatchAccess(req.requestId, user.uid);
      setAccessRequests((prev) =>
        prev.map((r) => r.requestId === req.requestId ? { ...r, status: MATCH_ACCESS_STATUS.REJECTED } : r)
      );
      showToast("Request rejected.", "info");
    } catch {
      showToast("Could not reject request.", "error");
    } finally {
      setActioningRequest(null);
    }
  };

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
    <PageContainer title={title} subtitle="Match control center for setup, sharing, and scorecard access.">
      <Stack spacing={2} sx={{ maxWidth: 960 }}>
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderColor: "divider" }}>
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

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} flexWrap="wrap">
              <AppButton variant="outlined" onClick={() => navigate(getMatchRoute(match, { isScorer: false }))}>
                View Scorecard
              </AppButton>
              <AppButton variant="outlined" onClick={() => setShareOpen(true)}>
                Share
              </AppButton>
              {isCompletedMatch(match) && (
                <AppButton variant="outlined" onClick={() => setShareCardOpen(true)}>
                  Share Result Card
                </AppButton>
              )}
              {/* Owner-only actions */}
              {isOwner && (
                <AppButton
                  variant="outlined"
                  onClick={() => navigate(`/matches/${matchId}/edit`)}
                  disabled={match.status !== "scheduled"}
                >
                  Edit (pre-match)
                </AppButton>
              )}
              {isOwner && (
                <AppButton variant="outlined" onClick={handleToggleVisibility}>
                  {match.isPublic === false ? "Make public" : "Make private"}
                </AppButton>
              )}
              {isOwner && (
                <AppButton variant="outlined" color="warning" onClick={handleArchive}>
                  Archive
                </AppButton>
              )}
              {/* Non-owner scorer: request access */}
              {isScorer && !isOwner && !hasAccess && (
                <>
                  {myAccessRequest?.status === MATCH_ACCESS_STATUS.PENDING ? (
                    <Chip
                      icon={<HourglassEmptyOutlinedIcon sx={{ fontSize: 16 }} />}
                      label="Access requested"
                      sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700 }}
                    />
                  ) : (
                    <AppButton
                      variant="outlined"
                      startIcon={<LockOutlinedIcon />}
                      onClick={handleRequestAccess}
                      loading={submittingRequest}
                    >
                      {myAccessRequest?.status === MATCH_ACCESS_STATUS.REJECTED ? "Request Again" : "Request to Score"}
                    </AppButton>
                  )}
                </>
              )}
              {/* Non-owner approved collaborator */}
              {isScorer && !isOwner && hasAccess && (
                <Chip
                  label="Collaborator"
                  size="small"
                  sx={{ bgcolor: "rgba(34,197,94,0.12)", color: "#16A34A", fontWeight: 700 }}
                />
              )}
            </Stack>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderColor: "divider" }}>
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
            {match.playerOfTheMatch && (
              <Typography variant="body2">
                Player of the Match:{" "}
                <strong>{match.playerOfTheMatch}</strong>
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              Notes: {match.notes?.trim() ? match.notes : "—"}
            </Typography>
          </Stack>
        </Paper>
      </Stack>

      {/* Access requests panel — visible to match owner only */}
      {isOwner && accessRequests.length > 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, borderColor: "divider", maxWidth: 960 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>Scorer Access Requests</Typography>
          <Divider sx={{ mb: 1.5 }} />
          <Stack spacing={1.5}>
            {accessRequests.map((req) => {
              const isPending = req.status === MATCH_ACCESS_STATUS.PENDING;
              const isBusy = actioningRequest === req.requestId;
              return (
                <Stack
                  key={req.requestId}
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1.5}
                  sx={{ p: 1.5, borderRadius: 1, border: "1px solid", borderColor: isPending ? "primary.main" : "divider", bgcolor: isPending ? "rgba(108,99,255,0.03)" : "transparent" }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(108,99,255,0.12)", color: "primary.main" }}>
                      <PersonOutlinedIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={700}>{req.requestedByName || "—"}</Typography>
                        {req.status === MATCH_ACCESS_STATUS.APPROVED && (
                          <Chip icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />} label="Approved" size="small" sx={{ bgcolor: "rgba(34,197,94,0.12)", color: "#16A34A", fontWeight: 700, fontSize: "0.7rem" }} />
                        )}
                        {req.status === MATCH_ACCESS_STATUS.REJECTED && (
                          <Chip icon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />} label="Rejected" size="small" sx={{ bgcolor: "rgba(239,68,68,0.12)", color: "error.main", fontWeight: 700, fontSize: "0.7rem" }} />
                        )}
                        {isPending && (
                          <Chip label="Pending" size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700, fontSize: "0.7rem" }} />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">{req.requestedByEmail}</Typography>
                    </Box>
                  </Stack>
                  {isPending && (
                    <Stack direction="row" spacing={1}>
                      <AppButton size="small" variant="outlined" onClick={() => handleRejectRequest(req)} loading={isBusy} disabled={isBusy} sx={{ borderColor: "error.main", color: "error.main", minWidth: 80 }}>
                        Reject
                      </AppButton>
                      <AppButton size="small" variant="contained" onClick={() => handleApproveRequest(req)} loading={isBusy} disabled={isBusy} sx={{ minWidth: 80, bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" } }}>
                        Approve
                      </AppButton>
                    </Stack>
                  )}
                </Stack>
              );
            })}
          </Stack>
        </Paper>
      )}

      <ShareMatchDialog open={shareOpen} onClose={() => setShareOpen(false)} matchId={matchId} title={title} />
      <ResultShareDialog open={shareCardOpen} onClose={() => setShareCardOpen(false)} match={match} />
    </PageContainer>
  );
};

export default MatchDetailsPage;

