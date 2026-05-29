/* eslint-disable react/prop-types */
import { memo } from "react";
import { Box, List, ListItemButton, Stack, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AppCard from "../ui/AppCard";
import EmptyState from "../ui/EmptyState";
import { CardSkeleton } from "../ui/LoadingState";
import { getMatchRoute } from "../../utils/matchDisplay";
import { useAuth } from "../../context/AuthContext";
import MatchActionsMenu from "../match/MatchActionsMenu";
import SportsCricketOutlinedIcon from "@mui/icons-material/SportsCricketOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";

const MatchListSection = memo(
  ({ title, matches = [], loading, emptyTitle, emptyDescription, renderLine }) => {
    const navigate = useNavigate();
    const { isScorer } = useAuth();

    if (loading) {
      return (
        <AppCard title={title}>
          <CardSkeleton />
        </AppCard>
      );
    }

    if (!matches.length) {
      return (
        <AppCard title={title}>
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </AppCard>
      );
    }

    const getStatusIcon = (status) => {
      if (["ongoing", "in_progress", "in-progress"].includes(status?.toLowerCase())) {
        return (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 1, bgcolor: "rgba(34, 197, 94, 0.12)" }}>
            <SportsCricketOutlinedIcon sx={{ color: "#22C55E", fontSize: 16 }} className="live-pulse" />
          </Box>
        );
      }
      if (status?.toLowerCase() === "scheduled") {
        return (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 1, bgcolor: "rgba(245, 158, 11, 0.12)" }}>
            <CalendarMonthOutlinedIcon sx={{ color: "#F59E0B", fontSize: 16 }} />
          </Box>
        );
      }
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 1, bgcolor: "rgba(56, 189, 248, 0.12)" }}>
          <WorkspacePremiumOutlinedIcon sx={{ color: "#38BDF8", fontSize: 16 }} />
        </Box>
      );
    };

    const getChipColors = (status) => {
      if (["ongoing", "in_progress", "in-progress"].includes(status?.toLowerCase())) {
        return { color: "#22C55E", bgcolor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" };
      }
      if (status?.toLowerCase() === "scheduled") {
        return { color: "#F59E0B", bgcolor: "rgba(245, 158, 11, 0.1)", borderColor: "rgba(245, 158, 11, 0.2)" };
      }
      return { color: "#38BDF8", bgcolor: "rgba(56, 189, 248, 0.1)", borderColor: "rgba(56, 189, 248, 0.2)" };
    };

    return (
      <AppCard title={title}>
        <List sx={{ p: 0, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {matches.map((match) => {
            const chipColors = getChipColors(match.status);
            return (
              <ListItemButton
                key={match.matchId || match.id}
                onClick={() => navigate(getMatchRoute(match, { isScorer }))}
                aria-label={`Open ${renderLine(match)}`}
                sx={{
                  borderRadius: 1, // 8px
                  py: 1,
                  px: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255, 255, 255, 0.01)"
                      : "rgba(15, 23, 42, 0.015)",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "transform 120ms ease, border-color 120ms ease, background-color 120ms ease",
                  display: "block",
                  "&:hover": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.025)"
                        : "rgba(15, 23, 42, 0.04)",
                    transform: "translateX(2px)",
                    borderColor: "rgba(108, 99, 255, 0.15)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%" }}
                  spacing={1.5}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flexGrow: 1 }}>
                    {getStatusIcon(match.status)}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }} noWrap>
                        {renderLine(match)}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
                        {match.status && (
                          <Chip
                            size="small"
                            label={match.status}
                            sx={{
                              fontWeight: 700,
                              textTransform: "uppercase",
                              fontSize: "0.6rem",
                              height: 16,
                              ...chipColors,
                            }}
                            variant="outlined"
                          />
                        )}
                        {match.isPublic === false ? (
                          <Chip
                            size="small"
                            label="Private"
                            sx={{
                              fontWeight: 700,
                              textTransform: "uppercase",
                              fontSize: "0.6rem",
                              height: 16,
                              color: "#EF4444",
                              bgcolor: "rgba(239, 68, 68, 0.08)",
                              borderColor: "rgba(239, 68, 68, 0.15)",
                            }}
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="Public Live"
                            sx={{
                              fontWeight: 700,
                              textTransform: "uppercase",
                              fontSize: "0.6rem",
                              height: 16,
                              color: "#38BDF8",
                              bgcolor: "rgba(56, 189, 248, 0.08)",
                              borderColor: "rgba(56, 189, 248, 0.15)",
                            }}
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                  {isScorer && (
                    <Box onClick={(e) => e.stopPropagation()} sx={{ flexShrink: 0 }}>
                      <MatchActionsMenu match={match} />
                    </Box>
                  )}
                </Stack>
              </ListItemButton>
            );
          })}
        </List>
      </AppCard>
    );
  }
);

MatchListSection.displayName = "MatchListSection";

export default MatchListSection;
