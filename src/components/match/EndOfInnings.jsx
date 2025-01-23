import React, { useState } from "react";
import { Button, Typography, Stack } from "@mui/material";
import BattingScoreCard from "./BattingScoreCard";
import BowlingScoreCard from "./BowlingScoreCard";
import { useNavigate } from "react-router-dom";
import { updateMatchInnings } from "../../services/firebaseServices";

function EndOfInnings({
  isInningsOver,
  battingTeam,
  bowlingTeam,
  currentInning,
  setIsInningsOver,
  matchId,
}) {
  const [showScoreCard, setShowScoreCard] = useState(false);
  const navigate = useNavigate();

  const viewScoreCard = () => {
    setShowScoreCard(true);
  };
  const startSecondInnings = () => {
    updateMatchInnings(matchId, 2);
    navigate(`/start-second-innings?matchId=${matchId}`);
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {/* Show different views based on the innings */}

      {isInningsOver && !showScoreCard && (
        <Stack spacing={2} alignItems="center">
          {/* End of Innings Summary */}

          <Typography variant="h5" color="primary">
            End of 1st Innings
          </Typography>
          <Typography variant="h5">{battingTeam.name}</Typography>
          <Typography variant="body1">
            Total: {currentInning.runs}/{currentInning.wickets} in{" "}
            {currentInning.overs} overs
          </Typography>
          <Typography variant="body1" color="secondary">
            Target: {currentInning.runs + 1} runs
          </Typography>
          {/* Button to Start Second Innings */}
          <Button variant="contained" color="success" onClick={viewScoreCard}>
            View Scorecard
          </Button>
        </Stack>
      )}
      {isInningsOver && showScoreCard && (
        <Stack spacing={3}>
          <Stack display="flex" alignItems="flex-end">
            <Button variant="outlined" onClick={startSecondInnings}>
              Start 2nd Innings
            </Button>
          </Stack>
          <BattingScoreCard
            battingTeam={battingTeam.name}
            currentInning={currentInning}
          ></BattingScoreCard>
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
