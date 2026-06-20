/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CloseIcon from "@mui/icons-material/Close";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useNotifications from "../hooks/firebase/useNotifications";
import {
  dismissNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/firebase/notificationService";
import PageContainer from "../components/ui/PageContainer";
import AppButton from "../components/ui/AppButton";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META = {
  match_started: {
    icon: <SportsCricketIcon sx={{ fontSize: 18, color: "#22C55E" }} />,
    chipLabel: "Live",
    chipColor: "rgba(34,197,94,0.1)",
    chipTextColor: "#22C55E",
    navPath: (matchId) => `/live/${matchId}`,
    navLabel: "Watch Live",
  },
  match_completed: {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#6C63FF" }} />,
    chipLabel: "Result",
    chipColor: "rgba(108,99,255,0.1)",
    chipTextColor: "#6C63FF",
    navPath: (matchId) => `/scorecard/${matchId}`,
    navLabel: "View Scorecard",
  },
  potm_announced: {
    icon: <EmojiEventsIcon sx={{ fontSize: 18, color: "#F59E0B" }} />,
    chipLabel: "POTM",
    chipColor: "rgba(245,158,11,0.1)",
    chipTextColor: "#F59E0B",
    navPath: (matchId) => `/scorecard/${matchId}`,
    navLabel: "View Scorecard",
  },
};

const formatRelativeTime = (createdAt) => {
  if (!createdAt) return "";
  const ts =
    typeof createdAt.toMillis === "function"
      ? createdAt.toMillis()
      : new Date(createdAt).getTime();
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
};

// ── Notification row ──────────────────────────────────────────────────────────

const NotificationRow = ({ notif }) => {
  const navigate = useNavigate();
  const meta = TYPE_META[notif.type] || TYPE_META.match_completed;

  const handleClick = async () => {
    if (!notif.read) {
      markNotificationRead(notif.id).catch(() => {});
    }
    navigate(meta.navPath(notif.matchId));
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    dismissNotification(notif.id).catch(() => {});
  };

  const handleMarkRead = (e) => {
    e.stopPropagation();
    if (!notif.read) markNotificationRead(notif.id).catch(() => {});
  };

  return (
    <Paper
      variant="outlined"
      onClick={handleClick}
      sx={{
        p: 0,
        borderColor: notif.read ? "divider" : "rgba(108,99,255,0.25)",
        bgcolor: notif.read ? "transparent" : (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(108,99,255,0.04)"
            : "rgba(108,99,255,0.02)",
        borderRadius: 1.5,
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
        overflow: "hidden",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      {/* Unread indicator stripe */}
      {!notif.read && (
        <Box sx={{ height: 2.5, background: "linear-gradient(90deg, #6C63FF, #8B5CF6)" }} />
      )}

      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ p: 1.75 }}>
        {/* Type icon */}
        <Box
          sx={{
            mt: 0.25,
            width: 32,
            height: 32,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: meta.chipColor,
            flexShrink: 0,
          }}
        >
          {meta.icon}
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: notif.read ? 500 : 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
            >
              {notif.title}
            </Typography>
            <Chip
              size="small"
              label={meta.chipLabel}
              sx={{
                height: 16,
                fontSize: "0.58rem",
                fontWeight: 800,
                bgcolor: meta.chipColor,
                color: meta.chipTextColor,
                flexShrink: 0,
              }}
            />
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5, lineHeight: 1.4 }}
          >
            {notif.body}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>
              {formatRelativeTime(notif.createdAt)}
            </Typography>
            <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
              {!notif.read && (
                <Tooltip title="Mark as read">
                  <IconButton
                    size="small"
                    onClick={handleMarkRead}
                    sx={{ p: 0.4, color: "text.disabled", "&:hover": { color: "primary.main" } }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Dismiss">
                <IconButton
                  size="small"
                  onClick={handleDismiss}
                  sx={{ p: 0.4, color: "text.disabled", "&:hover": { color: "error.main" } }}
                >
                  <CloseIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const NotificationsPage = () => {
  const { user } = useAuth();
  const uid = user?.uid;
  const { notifications, unreadCount, loading } = useNotifications(uid);

  const handleMarkAllRead = async () => {
    if (!uid) return;
    await markAllNotificationsRead(uid).catch(() => {});
  };

  return (
    <PageContainer
      title="Notifications"
      subtitle="Stay updated on matches you follow."
    >
      <Box sx={{ maxWidth: 680 }}>
        {/* Header row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <NotificationsActiveIcon sx={{ color: "primary.main", fontSize: 22 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              All Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                size="small"
                label={`${unreadCount} unread`}
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: "rgba(108,99,255,0.12)",
                  color: "primary.main",
                }}
              />
            )}
          </Stack>

          {unreadCount > 0 && (
            <AppButton
              variant="outlined"
              size="small"
              onClick={handleMarkAllRead}
              sx={{ minHeight: 32, fontSize: "0.78rem" }}
            >
              Mark all read
            </AppButton>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Loading */}
        {loading && (
          <Stack spacing={1}>
            {[0, 1, 2].map((i) => (
              <Paper
                key={i}
                variant="outlined"
                sx={{ p: 1.75, borderColor: "divider", borderRadius: 1.5 }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="55%" height={20} />
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="25%" height={14} />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <Paper
            variant="outlined"
            sx={{ p: 4, textAlign: "center", borderColor: "divider", borderRadius: 2 }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Follow a match on the live or scorecard page to receive updates when it starts,
              finishes, or a Player of the Match is announced.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              href="/discover"
              sx={{ borderRadius: 1 }}
            >
              Discover Matches
            </Button>
          </Paper>
        )}

        {/* Notification list */}
        {!loading && notifications.length > 0 && (
          <Stack spacing={1}>
            {notifications.map((notif) => (
              <NotificationRow key={notif.id} notif={notif} />
            ))}
          </Stack>
        )}
      </Box>
    </PageContainer>
  );
};

export default NotificationsPage;
