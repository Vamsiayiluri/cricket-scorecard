/* eslint-disable react/prop-types */
import { memo } from "react";
import { Box, Grid, Stack, Typography, LinearProgress, Divider } from "@mui/material";
import StatusBadge from "../ui/StatusBadge";
import { CardSkeleton } from "../ui/LoadingState";
import {
  formatMatchDate,
  getCompletedResultLine,
  getCurrentInningSummary,
  getMatchResultHeadline,
  getMatchTitle,
  isCompletedMatch,
} from "../../utils/matchDisplay";
import { MATCH_STATUS } from "../../services/firebase/constants";
import BallTimeline from "../match/BallTimeline";
import {
  getOverHistoryForInning,
  getRecentBallsForInning,
} from "../../utils/scorecardTimeline";

const getTeamName = (match, teamKey) =>
  match?.teams?.[teamKey]?.name || match?.matchDetails?.[teamKey] || teamKey;

const LiveScoreboard = memo(({ match, loading }) => {
  if (loading) {
    return <CardSkeleton />;
  }

  if (!match) {
    return null;
  }

  const title = getMatchTitle(match);
  const currentInningIndex = (match?.scoreCard?.currentInning || 1) - 1;
  const currentInning = match?.scoreCard?.innings?.[currentInningIndex];
  const innings = match?.scoreCard?.innings || [];
  const recentBalls = getRecentBallsForInning(match?.scoreCard, currentInningIndex);
  const overHistory = getOverHistoryForInning(match?.scoreCard, currentInningIndex);
  const totalBalls = (match?.scoringRules?.maxOvers || 0) * 6;
  const ballsBowled = currentInning?.balls || 0;
  const progress =
    totalBalls > 0 ? Math.min(100, Math.round((ballsBowled / totalBalls) * 100)) : 0;
  const completed = isCompletedMatch(match);
  const displayStatus = completed ? MATCH_STATUS.COMPLETED : match.status;
  const resultHeadline = getMatchResultHeadline(match);
  const resultLine = getCompletedResultLine(match);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</Typography>
        <StatusBadge status={displayStatus} />
      </Stack>

      <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ color: "#8B5CF6" }}>●</span> {match?.matchDetails?.location || "Venue TBD"} · {formatMatchDate(match?.matchDetails?.date)}
      </Typography>

      {match?.tossDetails?.winner && (
        <Box sx={{ p: 1, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "#38BDF8", display: "block" }}>
            Toss: {match.tossDetails.winner} won & elected to {match.tossDetails.decision?.toLowerCase()} first
          </Typography>
        </Box>
      )}

      {currentInning && match.status === MATCH_STATUS.IN_PROGRESS && !completed && (
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #071120 100%)",
            color: "#F8FAFC",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 1,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 2,
              background: "linear-gradient(90deg, #6C63FF 0%, #8B5CF6 50%, #22C55E 100%)",
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Box sx={{ px: 1, py: 0.25, borderRadius: 0.5, bgcolor: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="live-pulse" style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#EF4444", display: "inline-block" }}></span>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#EF4444", textTransform: "uppercase", fontSize: "0.6rem", letterSpacing: "0.05em" }}>
                Live Stream
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Innings {match.scoreCard.currentInning} Progression
            </Typography>
          </Stack>

          <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" }, fontWeight: 900, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
            {getTeamName(match, currentInning.team)} <span style={{ color: "#22C55E" }}>{getCurrentInningSummary(match)}</span>
          </Typography>
          
          {match.scoreCard.currentInning === 2 && innings[0] && (
            <Box sx={{ mt: 1, display: "inline-block", p: "4px 8px", borderRadius: 0.5, bgcolor: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.15)" }}>
              <Typography variant="caption" sx={{ color: "#38BDF8", fontWeight: 700 }}>
                Target: {innings[0].runs + 1}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Overs completed: {typeof currentInning.overs === "number" ? currentInning.overs.toFixed(1) : "0.0"} / {match.scoringRules?.maxOvers}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#22C55E" }}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.08)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #22C55E 0%, #4ade80 100%)",
                },
              }}
            />
          </Box>
        </Box>
      )}

      {completed && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            border: "1px solid rgba(34, 197, 94, 0.15)",
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.04) 0%, rgba(7, 17, 32, 0.95) 100%)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ px: 1, py: 0.25, borderRadius: 0.5, bgcolor: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: "#22C55E", textTransform: "uppercase", fontSize: "0.6rem" }}>
                Completed
              </Typography>
            </Box>
          </Stack>
          <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5, letterSpacing: "-0.01em" }}>
            {resultHeadline}
          </Typography>
          {resultLine !== resultHeadline && (
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>{resultLine}</Typography>
          )}
          <Divider sx={{ my: 1.5, borderColor: "divider" }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Player of the Match: <span style={{ color: "#38BDF8" }}>To be announced</span>
          </Typography>
        </Box>
      )}

      {match.status === MATCH_STATUS.SCHEDULED && !completed && (
        <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper" }}>
          <Stack spacing={1} sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, textTransform: "uppercase" }}>
              Upcoming Match
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary" }}>
              Match has not started yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto" }}>
              Live scoring telemetry and scorecard updates will go active as soon as the opening ball is delivered.
            </Typography>
          </Stack>
        </Box>
      )}

      {innings.length > 0 && (
        <Grid container spacing={2}>
          {innings.map((inning, index) => {
            const runs = inning?.runs || 0;
            const wickets = inning?.wickets || 0;
            const overs = typeof inning?.overs === "number" ? inning.overs.toFixed(1) : "0.0";

            return (
              <Grid item xs={12} md={6} key={`inning-${index}`}>
                <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper" }}>
                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 800, textTransform: "uppercase", mb: 1 }}>
                    Innings {index + 1} Scorecard
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {getTeamName(match, inning?.team)}
                  </Typography>
                  <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 0.5 }}>
                    <Typography variant="h2" sx={{ fontWeight: 900, color: "primary.light" }}>
                      {runs}/{wickets}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {overs} overs bowled
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
      
    </Stack>
  );
});

LiveScoreboard.displayName = "LiveScoreboard";

export default LiveScoreboard;
