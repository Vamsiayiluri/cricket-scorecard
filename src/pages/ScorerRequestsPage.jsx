import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
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

const statusChip = (status) => {
  if (status === REQUEST_STATUS.APPROVED)
    return <Chip label="Approved" size="small" sx={{ bgcolor: "rgba(34,197,94,0.12)", color: "#16A34A", fontWeight: 700, fontSize: "0.7rem" }} />;
  if (status === REQUEST_STATUS.REJECTED)
    return <Chip label="Rejected" size="small" sx={{ bgcolor: "rgba(239,68,68,0.12)", color: "error.main", fontWeight: 700, fontSize: "0.7rem" }} />;
  return <Chip label="Pending" size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700, fontSize: "0.7rem" }} />;
};

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const ScorerRequestsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null); // requestId being actioned

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllRequests();
      // Sort: pending first, then by requestedAt desc
      data.sort((a, b) => {
        if (a.status === REQUEST_STATUS.PENDING && b.status !== REQUEST_STATUS.PENDING) return -1;
        if (b.status === REQUEST_STATUS.PENDING && a.status !== REQUEST_STATUS.PENDING) return 1;
        const aMs = a.requestedAt?.toMillis?.() ?? 0;
        const bMs = b.requestedAt?.toMillis?.() ?? 0;
        return bMs - aMs;
      });
      setRequests(data);
    } catch {
      showToast("Could not load requests.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (req) => {
    setActioning(req.requestId);
    try {
      await approveRequest(req.requestId, req.uid, user.uid);
      showToast(`${req.displayName || req.email} is now a Scorer.`, "success");
      setRequests((prev) =>
        prev.map((r) => r.requestId === req.requestId ? { ...r, status: REQUEST_STATUS.APPROVED } : r)
      );
    } catch {
      showToast("Could not approve request. Please try again.", "error");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (req) => {
    setActioning(req.requestId);
    try {
      await rejectRequest(req.requestId, user.uid);
      showToast("Request rejected.", "info");
      setRequests((prev) =>
        prev.map((r) => r.requestId === req.requestId ? { ...r, status: REQUEST_STATUS.REJECTED } : r)
      );
    } catch {
      showToast("Could not reject request. Please try again.", "error");
    } finally {
      setActioning(null);
    }
  };

  const pending = requests.filter((r) => r.status === REQUEST_STATUS.PENDING);
  const resolved = requests.filter((r) => r.status !== REQUEST_STATUS.PENDING);

  const RequestRow = ({ req }) => {
    const isPending = req.status === REQUEST_STATUS.PENDING;
    const isBusy = actioning === req.requestId;

    return (
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 1.5, borderColor: isPending ? "primary.main" : "divider", bgcolor: isPending ? "rgba(108,99,255,0.03)" : "transparent" }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                bgcolor: "rgba(108,99,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <PersonOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="body2" fontWeight={700}>
                  {req.displayName || "—"}
                </Typography>
                {statusChip(req.status)}
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {req.email}
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.2 }}>
                Requested {formatDate(req.requestedAt)}
              </Typography>
            </Box>
          </Stack>

          {isPending && (
            <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
              <AppButton
                size="small"
                variant="outlined"
                onClick={() => handleReject(req)}
                loading={isBusy}
                disabled={isBusy}
                sx={{ borderColor: "error.main", color: "error.main", minWidth: 90 }}
              >
                Reject
              </AppButton>
              <AppButton
                size="small"
                variant="contained"
                onClick={() => handleApprove(req)}
                loading={isBusy}
                disabled={isBusy}
                sx={{ minWidth: 90, bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" } }}
              >
                Approve
              </AppButton>
            </Stack>
          )}

          {!isPending && (
            <Typography variant="caption" color="text.disabled">
              Resolved {formatDate(req.resolvedAt)}
            </Typography>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <PageContainer
      title="Scorer Requests"
      subtitle="Review and approve requests from viewers who want scorer access."
    >
      {loading && (
        <Typography variant="body2" color="text.secondary">Loading requests…</Typography>
      )}

      {!loading && requests.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <HourglassEmptyOutlinedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">No scorer requests yet.</Typography>
        </Paper>
      )}

      {!loading && pending.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h5" fontWeight={700}>Pending</Typography>
            <Chip label={pending.length} size="small" sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "warning.dark", fontWeight: 700 }} />
          </Stack>
          <Stack spacing={1.5}>
            {pending.map((r) => <RequestRow key={r.requestId} req={r} />)}
          </Stack>
        </Box>
      )}

      {!loading && resolved.length > 0 && (
        <Box>
          {pending.length > 0 && <Divider sx={{ mb: 3 }} />}
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1.5 }}>Resolved</Typography>
          <Stack spacing={1.5}>
            {resolved.map((r) => <RequestRow key={r.requestId} req={r} />)}
          </Stack>
        </Box>
      )}
    </PageContainer>
  );
};

export default ScorerRequestsPage;
