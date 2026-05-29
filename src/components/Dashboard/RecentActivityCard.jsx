/* eslint-disable react/prop-types */
import { memo } from "react";
import { List, ListItem, Typography, Box } from "@mui/material";
import AppCard from "../ui/AppCard";
import EmptyState from "../ui/EmptyState";
import { CardSkeleton } from "../ui/LoadingState";
import StatusBadge from "../ui/StatusBadge";
import { formatMatchDate, getMatchTitle } from "../../utils/matchDisplay";

const RecentActivityCard = memo(({ matches = [], loading }) => {
  if (loading) {
    return (
      <AppCard title="Recent Activity">
        <CardSkeleton />
      </AppCard>
    );
  }

  if (!matches.length) {
    return (
      <AppCard title="Recent Activity">
        <EmptyState title="No recent activity" description="Match updates will appear here in realtime." />
      </AppCard>
    );
  }

  return (
    <AppCard title="Recent Activity" subtitle="Latest match updates from database.">
      <List sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {matches.map((match) => (
          <ListItem
            key={match.matchId || match.id}
            sx={{
              px: 0,
              py: 0.75,
              borderBottom: "1px solid",
              borderColor: "divider",
              "&:last-child": { borderBottom: "none" },
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {getMatchTitle(match)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.7rem" }}>
                {formatMatchDate(match?.updatedAt || match?.matchDetails?.date)}
              </Typography>
            </Box>
            <StatusBadge status={match.status} />
          </ListItem>
        ))}
      </List>
    </AppCard>
  );
});

RecentActivityCard.displayName = "RecentActivityCard";

export default RecentActivityCard;
