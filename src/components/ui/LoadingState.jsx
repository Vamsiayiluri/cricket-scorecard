/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";

/* ─── Shimmer Skeleton Atom ─── */
const ShimmerBar = ({ width = "100%", height = 14, sx = {} }) => (
  <Box
    className="skeleton-shimmer"
    sx={{ width, height, borderRadius: "8px", mb: 1, ...sx }}
  />
);

/* ─── Page-level Loading State ─── */
export const PageLoading = ({ text = "Loading data…" }) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    spacing={3}
    role="status"
    aria-live="polite"
    sx={{ minHeight: "40vh" }}
  >
    {/* Animated spinner ring */}
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "3px solid rgba(108, 99, 255, 0.15)",
        borderTopColor: "#8B5CF6",
        animation: "spin 0.9s linear infinite",
        "@keyframes spin": {
          to: { transform: "rotate(360deg)" },
        },
      }}
    />
    <Typography
      variant="body2"
      sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: "0.02em" }}
    >
      {text}
    </Typography>
  </Stack>
);

/* ─── Match Row Skeleton ─── */
export const MatchRowSkeleton = () => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      mb: 1.5,
      background: "rgba(15, 23, 42, 0.5)",
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
      <ShimmerBar width="55%" height={16} />
      <ShimmerBar width="18%" height={22} sx={{ borderRadius: "99px" }} />
    </Stack>
    <ShimmerBar width="35%" height={12} />
    <ShimmerBar width="45%" height={12} />
  </Box>
);

/* ─── Card-level Skeleton ─── */
export const CardSkeleton = ({ rows = 3 }) => (
  <Box role="status" aria-label="Loading content">
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <ShimmerBar width="42%" height={20} />
      <ShimmerBar width="20%" height={28} sx={{ borderRadius: "99px" }} />
    </Stack>
    {Array.from({ length: rows }).map((_, i) => (
      <ShimmerBar key={i} width={`${85 - i * 10}%`} height={14} />
    ))}
  </Box>
);

/* ─── Stats Overview Skeleton ─── */
export const StatsSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: 2,
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <Box
        key={i}
        sx={{
          p: 2.5,
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          background: "rgba(15, 23, 42, 0.5)",
        }}
      >
        <ShimmerBar width="60%" height={12} />
        <ShimmerBar width="40%" height={32} sx={{ mt: 1 }} />
      </Box>
    ))}
  </Box>
);

/* ─── Live Scoreboard Skeleton ─── */
export const ScoreboardSkeleton = () => (
  <Stack spacing={3}>
    <Stack direction="row" justifyContent="space-between">
      <ShimmerBar width="50%" height={28} />
      <ShimmerBar width="22%" height={28} sx={{ borderRadius: "99px" }} />
    </Stack>
    <Box
      sx={{
        p: 4,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        background: "rgba(15, 23, 42, 0.6)",
      }}
    >
      <ShimmerBar width="30%" height={14} />
      <ShimmerBar width="55%" height={48} sx={{ mt: 1.5 }} />
      <ShimmerBar width="100%" height={8} sx={{ mt: 3, borderRadius: "99px" }} />
    </Box>
  </Stack>
);
