/* eslint-disable react/prop-types */
import { memo } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BattingScoreCard from "../match/BattingScoreCard";
import BowlingScoreCard from "../match/BowlingScoreCard";
import { CardSkeleton } from "../ui/LoadingState";
import BallTimeline from "../match/BallTimeline";
import {
  getOverHistoryForInning,
  getRecentBallsForInning,
} from "../../utils/scorecardTimeline";

const getTeamNameFromMatch = (match, teamKey) =>
  match?.teams?.[teamKey]?.name || match?.matchDetails?.[teamKey] || teamKey;

const PublicMatchScorecard = memo(({ match, loading }) => {
  if (loading) {
    return <CardSkeleton />;
  }

  const innings = match?.scoreCard?.innings || [];
  if (!innings.length) {
    return (
      <Typography variant="body1" color="text.secondary">
        Scorecard will appear once the match starts.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {innings.map((inning, index) => {
        const battingTeamName = getTeamNameFromMatch(match, inning?.team);
        const bowlingTeamKey = inning?.team === "teamA" ? "teamB" : "teamA";
        const bowlingTeamName = getTeamNameFromMatch(match, bowlingTeamKey);
        const runs = inning?.runs || 0;
        const wickets = inning?.wickets || 0;
        const overs = typeof inning?.overs === "number" ? inning.overs.toFixed(1) : "0.0";

        const recentBalls = getRecentBallsForInning(match?.scoreCard, index);
        const overHistory = getOverHistoryForInning(match?.scoreCard, index);

        return (
          <Accordion
            key={`scorecard-${index}`}
            defaultExpanded={index === innings.length - 1}
            sx={{
              borderRadius: "12px !important",
              boxShadow: "none",
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&::before": { display: "none" },
              "&.Mui-expanded": { margin: "0 0 12px 0" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ minHeight: 48, "&.Mui-expanded": { minHeight: 48 } }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={0.75} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ width: "100%", pr: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{battingTeamName} — Innings {index + 1}</Typography>
                <Chip
                  size="small"
                  label={`${runs}/${wickets} (${overs} ov)`}
                  variant="outlined"
                  sx={{ height: 18, fontSize: "0.675rem" }}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1.5, pt: 0 }}>
              <Stack spacing={1.5}>
                <BattingScoreCard battingTeam={battingTeamName} currentInning={inning} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Extras: {inning.extras?.[0]?.total || 0}
                  </Typography>
                </Box>
                <BallTimeline
                  recentBalls={recentBalls}
                  overHistory={overHistory}
                  title="Recent Over Progression"
                />
                <BowlingScoreCard bowlingTeam={bowlingTeamName} currentInning={inning} />
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
});

PublicMatchScorecard.displayName = "PublicMatchScorecard";

export default PublicMatchScorecard;
