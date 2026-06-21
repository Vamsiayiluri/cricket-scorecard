/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import PageContainer from "../components/ui/PageContainer";
import AppButton from "../components/ui/AppButton";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  REQUEST_STATUS,
} from "../services/firebase/scorerRequestService";
import {
  getMatchAccessRequestsForOwner,
  approveMatchAccess,
  rejectMatchAccess,
  MATCH_ACCESS_STATUS,
} from "../services/firebase/matchAccessService";
import { USER_ROLES } from "../services/firebase/constants";

const statusChip = (status, isPending) =>
  isPending
    ? <Chip label="Pending" size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700, fontSize: "0.7rem" }} />
    : status === "approved"
    ? <Chip icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />} label="Approved" size="small" sx={{ bgcolor: "rgba(34,197,94,0.12)", color: "#16A34A", fontWeight: 700, fontSize: "0.7rem" }} />
    : <Chip icon={<CancelOutlinedIcon sx={{ fontSize: 14 }} />} label="Rejected" size="small" sx={{ bgcolor: "rgba(239,68,68,0.12)", color: "error.main", fontWeight: 700, fontSize: "0.7rem" }} />;

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const PersonAvatar = ({ color = "primary.main", bg = "rgba(108,99,255,0.12)" }) => (
  <Box sx={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <PersonOutlinedIcon sx={{ fontSize: 20, color }} />
  </Box>
);

// ── Scorer role requests tab ──────────────────────────────────────────────────

const ScorerRoleRequests = ({ user }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    setLoading(true);
    getAllRequests()
      .then((data) => {
        data.sort((a, b) => {
          if (a.status === REQUEST_STATUS.PENDING && b.status !== REQUEST_STATUS.PENDING) return -1;
          if (b.status === REQUEST_STATUS.PENDING && a.status !== REQUEST_STATUS.PENDING) return 1;
          return (b.requestedAt?.toMillis?.() ?? 0) - (a.requestedAt?.toMillis?.() ?? 0);
        });
        setRequests(data);
      })
      .catch(() => showToast("Could not load scorer requests.", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleApprove = async (req) => {
    setActioning(req.requestId);
    try {
      await approveRequest(req.requestId, req.uid, user.uid);
      showToast(`${req.displayName || req.email} is now a Scorer.`, "success");
      setRequests((prev) => prev.map((r) => r.requestId === req.requestId ? { ...r, status: REQUEST_STATUS.APPROVED } : r));
    } catch {
      showToast("Could not approve request.", "error");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (req) => {
    setActioning(req.requestId);
    try {
      await rejectRequest(req.requestId, user.uid);
      showToast("Request rejected.", "info");
      setRequests((prev) => prev.map((r) => r.requestId === req.requestId ? { ...r, status: REQUEST_STATUS.REJECTED } : r));
    } catch {
      showToast("Could not reject request.", "error");
    } finally {
      setActioning(null);
    }
  };

  const pending = requests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const resolved = requests.filter((r) => r.status !== REQUEST_STATUS.PENDING);

  if (loading) return <Typography variant="body2" color="text.secondary">Loading…</Typography>;

  if (!requests.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
        <HourglassEmptyOutlinedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">No scorer role requests yet.</Typography>
      </Paper>
    );
  }

  const Row = ({ req }) => {
    const isPending = req.status === REQUEST_STATUS.PENDING;
    const isBusy = actioning === req.requestId;
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: isPending ? "primary.main" : "divider", bgcolor: isPending ? "rgba(108,99,255,0.03)" : "transparent" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonAvatar />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" fontWeight={700}>{req.displayName || "—"}</Typography>
                {statusChip(req.status, isPending)}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{req.email}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.2 }}>Requested {formatDate(req.requestedAt)}</Typography>
            </Box>
          </Stack>
          {isPending ? (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <AppButton size="small" variant="outlined" onClick={() => handleReject(req)} loading={isBusy} disabled={isBusy} sx={{ borderColor: "error.main", color: "error.main", minWidth: 90 }}>Reject</AppButton>
              <AppButton size="small" variant="contained" onClick={() => handleApprove(req)} loading={isBusy} disabled={isBusy} sx={{ minWidth: 90, bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" } }}>Approve</AppButton>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.disabled">Resolved {formatDate(req.resolvedAt)}</Typography>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box>
      {pending.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>Pending</Typography>
            <Chip label={pending.length} size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700 }} />
          </Stack>
          <Stack spacing={1.5}>{pending.map((r) => <Row key={r.requestId} req={r} />)}</Stack>
        </Box>
      )}
      {resolved.length > 0 && (
        <Box>
          {pending.length > 0 && <Divider sx={{ mb: 3 }} />}
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>Resolved</Typography>
          <Stack spacing={1.5}>{resolved.map((r) => <Row key={r.requestId} req={r} />)}</Stack>
        </Box>
      )}
    </Box>
  );
};

// ── Match access requests tab ─────────────────────────────────────────────────

const MatchAccessRequests = ({ user }) => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getMatchAccessRequestsForOwner(user.uid)
      .then(setRequests)
      .catch(() => showToast("Could not load match access requests.", "error"))
      .finally(() => setLoading(false));
  }, [showToast, user?.uid]);

  const handleApprove = async (req) => {
    setActioning(req.requestId);
    try {
      await approveMatchAccess(req.requestId, req.matchId, req.requestedBy, user.uid);
      showToast(`${req.requestedByName || req.requestedByEmail} can now score this match.`, "success");
      setRequests((prev) => prev.map((r) => r.requestId === req.requestId ? { ...r, status: MATCH_ACCESS_STATUS.APPROVED } : r));
    } catch {
      showToast("Could not approve request.", "error");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (req) => {
    setActioning(req.requestId);
    try {
      await rejectMatchAccess(req.requestId, user.uid);
      showToast("Request rejected.", "info");
      setRequests((prev) => prev.map((r) => r.requestId === req.requestId ? { ...r, status: MATCH_ACCESS_STATUS.REJECTED } : r));
    } catch {
      showToast("Could not reject request.", "error");
    } finally {
      setActioning(null);
    }
  };

  const pending = requests.filter((r) => r.status === MATCH_ACCESS_STATUS.PENDING);
  const resolved = requests.filter((r) => r.status !== MATCH_ACCESS_STATUS.PENDING);

  if (loading) return <Typography variant="body2" color="text.secondary">Loading…</Typography>;

  if (!requests.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
        <SportsCricketIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">No match access requests for your matches.</Typography>
      </Paper>
    );
  }

  const Row = ({ req }) => {
    const isPending = req.status === MATCH_ACCESS_STATUS.PENDING;
    const isBusy = actioning === req.requestId;
    return (
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5, borderColor: isPending ? "warning.main" : "divider", bgcolor: isPending ? "rgba(245,158,11,0.03)" : "transparent" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <PersonAvatar color="warning.dark" bg="rgba(245,158,11,0.12)" />
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" fontWeight={700}>{req.requestedByName || "—"}</Typography>
                {statusChip(req.status, isPending)}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{req.requestedByEmail}</Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.2 }}>
                Wants to score: <strong>{req.matchTitle || req.matchId}</strong>
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
                Requested {formatDate(req.requestedAt)}
              </Typography>
            </Box>
          </Stack>
          {isPending ? (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <AppButton size="small" variant="outlined" onClick={() => handleReject(req)} loading={isBusy} disabled={isBusy} sx={{ borderColor: "error.main", color: "error.main", minWidth: 90 }}>Reject</AppButton>
              <AppButton size="small" variant="contained" onClick={() => handleApprove(req)} loading={isBusy} disabled={isBusy} sx={{ minWidth: 90, bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" } }}>Approve</AppButton>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.disabled">Resolved {formatDate(req.resolvedAt)}</Typography>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box>
      {pending.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>Pending</Typography>
            <Chip label={pending.length} size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700 }} />
          </Stack>
          <Stack spacing={1.5}>{pending.map((r) => <Row key={r.requestId} req={r} />)}</Stack>
        </Box>
      )}
      {resolved.length > 0 && (
        <Box>
          {pending.length > 0 && <Divider sx={{ mb: 3 }} />}
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>Resolved</Typography>
          <Stack spacing={1.5}>{resolved.map((r) => <Row key={r.requestId} req={r} />)}</Stack>
        </Box>
      )}
    </Box>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const ScorerRequestsPage = () => {
  const { user, role } = useAuth();
  const [tab, setTab] = useState(0);
  const canReviewScorerRoles = role === USER_ROLES.SCORER;

  return (
    <PageContainer
      title="Requests"
      subtitle={canReviewScorerRoles ? "Approve scorer role requests and match access requests." : "Approve match access requests for your matches."}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 3, borderBottom: "1px solid", borderColor: "divider" }}
      >
        {canReviewScorerRoles && <Tab label="Scorer Role Requests" />}
        <Tab label="Match Access Requests" />
      </Tabs>

      {canReviewScorerRoles && tab === 0 && <ScorerRoleRequests user={user} />}
      {(!canReviewScorerRoles || tab === 1) && <MatchAccessRequests user={user} />}
    </PageContainer>
  );
};

export default ScorerRequestsPage;
