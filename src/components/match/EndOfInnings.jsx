/* eslint-disable react/prop-types */
import { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import FallOfWickets from "./FallOfWickets";
import { useNavigate } from "react-router-dom";
import { persistCurrentInning } from "../../services/firebase/scoringService";
import { scoringLog } from "../../utils/scoringDiagnostics";
import AppButton from "../ui/AppButton";

function EndOfInnings({
  isInningsOver,
  battingTeam,
  bowlingTeam,
  currentInning,
  matchId,
  inningsNumber = 1,
}) {
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [isStartingSecondInnings, setIsStartingSecondInnings] = useState(false);
  const [startInningsError, setStartInningsError] = useState("");
  const navigate = useNavigate();

  const viewScoreCard = () => {
    setShowScoreCard(true);
  };
  const startSecondInnings = async () => {
    if (isStartingSecondInnings) {
      return;
    }
    setIsStartingSecondInnings(true);
    setStartInningsError("");
    scoringLog("innings.second.start", { matchId, nextInning: 2 });
    try {
      await persistCurrentInning(matchId, 2);
      navigate(`/start-second-innings?matchId=${matchId}`);
    } catch (error) {
      setStartInningsError(error?.message || "Failed to start second innings.");
    } finally {
      setIsStartingSecondInnings(false);
    }
  };

  return (
    <Stack spacing={1.5} sx={{ p: 1 }}>
      {/* Show different views based on the innings */}

      {isInningsOver && !showScoreCard && (
        <Stack
          spacing={1.5}
          alignItems="center"
          sx={{
            py: { xs: 3, md: 4 },
            px: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.paper",
            textAlign: "center",
          }}
        >
          {/* End of Innings Summary */}
          <Typography variant="subtitle1" sx={{ color: "primary.main", fontWeight: 700 }}>
            {inningsNumber === 2 ? "Match Complete" : "End of 1st Innings"}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>{battingTeam.name}</Typography>
          <Box sx={{ px: 1.5, py: 0.75, borderRadius: 1, bgcolor: "rgba(108, 99, 255, 0.08)", border: "1px solid rgba(108, 99, 255, 0.18)" }}>
            <Typography variant="body2">
              Total: <Box component="span" sx={{ fontWeight: 800 }}>{currentInning.runs}/{currentInning.wickets}</Box> in{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>{currentInning.overs}</Box> overs
            </Typography>
          </Box>
          {inningsNumber === 1 ? (
            <Typography variant="body2" sx={{ color: "secondary.main", fontWeight: 700 }}>
              Target: {currentInning.runs + 1} runs
            </Typography>
          ) : null}
          {/* Button to Start Second Innings */}
          <AppButton variant="contained" onClick={viewScoreCard}>
            {inningsNumber === 2 ? "View Final Scorecard" : "View Scorecard"}
          </AppButton>
        </Stack>
      )}
      {isInningsOver && showScoreCard && (
        <Stack spacing={2}>
          {inningsNumber === 1 ? (
            <Stack display="flex" alignItems="flex-end">
              <AppButton
                variant="outlined"
                onClick={startSecondInnings}
                disabled={isStartingSecondInnings}
              >
                Start 2nd Innings
              </AppButton>
              {startInningsError ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {startInningsError}
                </Typography>
              ) : null}
            </Stack>
          ) : null}
          <BattingScoreCard
            battingTeam={battingTeam.name}
            currentInning={currentInning}
          ></BattingScoreCard>
          <FallOfWickets fallOfWickets={currentInning.fallOfWickets} />
          <BowlingScoreCard
            bowlingTeam={bowlingTeam}
            currentInning={currentInning}
          ></BowlingScoreCard>
        </Stack>
      )}
    </Stack>
  );
}

export default EndOfInnings;
