/* eslint-disable react/prop-types */
import { memo } from "react";
import { Grid, Box, Stack, Typography } from "@mui/material";
import AppCard from "../ui/AppCard";
import { CardSkeleton } from "../ui/LoadingState";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const MatchOverviewCard = memo(({ stats, loading }) => {
  if (loading) {
    return (
      <AppCard title="Match Overview">
        <CardSkeleton />
      </AppCard>
    );
  }

  const statItems = [
    {
      label: "Total Matches",
      value: stats?.total ?? 0,
      gradient: "linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(108, 99, 255, 0.03) 100%)",
      color: "#6C63FF",
      icon: <SportsCricketIcon sx={{ color: "#6C63FF", opacity: 0.8 }} />,
    },
    {
      label: "Active Live",
      value: stats?.ongoing ?? 0,
      gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.03) 100%)",
      color: "#22C55E",
      icon: <FiberManualRecordIcon className="live-pulse" sx={{ color: "#22C55E", fontSize: 18 }} />,
    },
    {
      label: "Upcoming Fixtures",
      value: stats?.upcoming ?? 0,
      gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0.04) 100%)",
      color: "#F59E0B",
      icon: <CalendarMonthIcon sx={{ color: "#F59E0B", opacity: 0.8 }} />,
    },
    {
      label: "Completed",
      value: stats?.completed ?? 0,
      gradient: "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(56, 189, 248, 0.03) 100%)",
      color: "#38BDF8",
      icon: <CheckCircleOutlineIcon sx={{ color: "#38BDF8", opacity: 0.8 }} />,
    },
  ];

  return (
    <AppCard title="Telemetry Summary" subtitle="Live updates synchronized with Firestore database.">
      <Grid container spacing={1.5}>
        {statItems.map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Box
              sx={{
                p: { xs: 1.5, sm: 1.75 },
                borderRadius: 1,
                background: stat.gradient,
                border: "1px solid",
                borderColor: "divider",
                borderLeft: `3px solid ${stat.color}`,
                position: "relative",
                overflow: "hidden",
                minHeight: 96,
                transition: "border-color 150ms ease, background-color 150ms ease",
                "&:hover": {
                  borderColor: "rgba(108, 99, 255, 0.2)",
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.68rem" }}>
                  {stat.label}
                </Typography>
                {stat.icon}
              </Stack>
              <Typography variant="h2" sx={{ fontWeight: 850, color: "text.primary", fontSize: { xs: "1.45rem", md: "1.65rem" }, mt: 1 }}>
                {stat.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </AppCard>
  );
});

MatchOverviewCard.displayName = "MatchOverviewCard";

export default MatchOverviewCard;
