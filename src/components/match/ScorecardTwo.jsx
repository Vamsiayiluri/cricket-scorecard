import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
} from "@mui/material";

const ScorecardTwo = ({ matchData, onScoreUpdate }) => {
  //   const matchData = {
  //     matchId: "some-unique-id",
  //     matchDetails: {
  //       name: "Test Match",
  //       location: "Stadium",
  //       date: "2024-12-30",
  //     },
  //     teams: {
  //       teamA: {
  //         name: "Team A",
  //         batsmen: ["Player A1", "Player A2", "Player A3"],
  //       },
  //       teamB: {
  //         name: "Team B",
  //         batsmen: ["Player B1", "Player B2", "Player B3"],
  //       },
  //     },
  //     tossDetails: { winner: "Team A", decision: "bat" },
  //     scoringRules: { maxOvers: 20, extras: { wides: true, noBalls: true } },
  //     scoreCard: {
  //       currentInning: 1,
  //       innings: [
  //         {
  //           team: "teamA",
  //           runs: 0,
  //           wickets: 0,
  //           overs: 0,
  //           balls: 0,
  //           batsmen: [
  //             { name: "Player A1", runs: 0, balls: 0, isOut: false },
  //             { name: "Player A2", runs: 0, balls: 0, isOut: false },
  //           ],
  //         },
  //       ],
  //       currentBowler: { name: "Player B1", overs: 0, runs: 0, wickets: 0 },
  //     },
  //     status: "in-progress",
  //     createdAt: "2024-12-24T10:00:00Z",
  //     updatedAt: "2024-12-24T10:30:00Z",
  //   };
  const [runs, setRuns] = useState(0);
  const [balls, setBalls] = useState(0);
  const [wickets, setWickets] = useState(0);

  const handleAddRun = (run) => {
    setRuns((prev) => prev + run);
    setBalls((prev) => prev + 1);

    if (balls % 6 === 5) {
      alert("Over Completed!");
    }

    onScoreUpdate({ runs: runs + run, balls: balls + 1, wickets });
  };

  const handleAddWicket = () => {
    setWickets((prev) => prev + 1);
    setBalls((prev) => prev + 1);

    onScoreUpdate({ runs, balls: balls + 1, wickets: wickets + 1 });
  };

  return (
    <Card sx={{ maxWidth: 800, margin: "auto", padding: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Live Scorecard
        </Typography>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Match Details</Typography>
          <Typography>{`Match: ${matchData.matchDetails.name}`}</Typography>
          <Typography>{`Location: ${matchData.matchDetails.location}`}</Typography>
          <Typography>{`Overs: ${Math.floor(balls / 6)}.${
            balls % 6
          }`}</Typography>
          <Typography>{`Runs: ${runs}`}</Typography>
          <Typography>{`Wickets: ${wickets}`}</Typography>
        </Box>
        <Box sx={{ marginBottom: 2 }}>
          <Typography variant="h6">Update Score</Typography>
          <Grid container spacing={2}>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddRun(1)}
              >
                +1 Run
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddRun(4)}
              >
                +4 Runs
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleAddRun(6)}
              >
                +6 Runs
              </Button>
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                color="error"
                onClick={handleAddWicket}
              >
                Wicket
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScorecardTwo;
