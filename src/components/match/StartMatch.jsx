/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Grid,
  Chip,
} from "@mui/material";
import { useToast } from "../../context/ToastContext";
import AppButton from "../ui/AppButton";

const StartMatch = ({ matchData, onStart, isStarting = false }) => {
  const { showToast } = useToast();
  const teams = matchData?.teams || {};
  const matchDetails = matchData?.matchDetails || {};
  const tossDetails = matchData?.tossDetails || {};

  const getBattingTeam = () => {
    if (matchData?.scoreCard?.currentInning) {
      if (matchData.scoreCard?.innings?.[0]?.team === "teamA") return "teamB";
      else {
        return "teamA";
      }
    } else {
      if (tossDetails.winner === teams.teamA?.name) {
        if (tossDetails.decision === "Bat") {
          return "teamA";
        } else {
          return "teamB";
        }
      } else if (tossDetails.winner === teams.teamB?.name) {
        if (tossDetails.decision === "Bat") {
          return "teamB";
        } else {
          return "teamA";
        }
      }
    }
  };
  const [battingTeam] = useState(getBattingTeam());
  const [players, setplayers] = useState({ batsman1: "", batsman2: "" });
  const [bowler, setBowler] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bowlingTeam = battingTeam === "teamA" ? "teamB" : "teamA";
  const battingTeamData = battingTeam ? teams[battingTeam] : null;
  const bowlingTeamData = bowlingTeam ? teams[bowlingTeam] : null;
  const battingPlayers = battingTeamData?.players || [];
  const bowlingPlayers = bowlingTeamData?.players || [];

  const handleStart = async () => {
    if (isStarting || isSubmitting) {
      return;
    }
    let updatedMatchData;
    if (!battingTeam || !players.batsman1 || !players.batsman2 || !bowler) {
      const message = "Please select the batting team, opening players, and bowler.";
      setFormError(message);
      showToast(message, "warning");
      return;
    }
    if (players.batsman1 === players.batsman2) {
      const message = "Striker and non-striker must be different players.";
      setFormError(message);
      showToast(message, "warning");
      return;
    }
    if (!battingTeamData || !bowlingTeamData) {
      const message = "Unable to resolve batting and bowling teams for this match.";
      setFormError(message);
      showToast(message, "error");
      return;
    }
    setFormError("");
    const inningObj = {
      team: battingTeam,
      battingTeam: battingTeamData.name,
      bowlingTeam: bowlingTeamData.name,
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      batsmen: [
        {
          name: players.batsman1,
          runs: 0,
          balls: 0,
          isOut: false,
          isNonStriker: false,
          fours: 0,
          sixes: 0,
        },
        {
          name: players.batsman2,
          runs: 0,
          balls: 0,
          isOut: false,
          isNonStriker: true,
          fours: 0,
          sixes: 0,
        },
      ],
      bowlers: [
        {
          name: bowler,
          overs: 0,
          runs: 0,
          wickets: 0,
          balls: 0,
          currentBowler: true,
        },
      ],
      extras: [
        {
          wides: 0,
          noBalls: 0,
          byes: 0,
          legByes: 0,
          total: 0,
        },
      ],
    };

    if (matchData.scoreCard?.currentInning) {
      const updatedInnings = [...(matchData.scoreCard?.innings || []), inningObj];

      updatedMatchData = {
        ...matchData,
        scoreCard: {
          ...matchData.scoreCard,
          innings: updatedInnings,
        },
        updatedAt: new Date(),
      };
    } else {
      updatedMatchData = {
        ...matchData,
        status: "in-progress",
        scoreCard: {
          currentInning: 1,
          innings: [inningObj],

          currentBowler: { name: bowler, overs: 0, runs: 0, wickets: 0 },
        },
        updatedAt: new Date(),
      };
    }
    setIsSubmitting(true);
    try {
      await onStart(updatedMatchData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={{ xs: 1, md: 2 }}>
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(120deg, rgba(108,99,255,0.18) 0%, rgba(34,197,94,0.08) 100%)"
              : "linear-gradient(120deg, rgba(108,99,255,0.08) 0%, rgba(34,197,94,0.06) 100%)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h3" gutterBottom>
          Live Match Console Setup
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip label={`${matchDetails.teamA || "Team A"} vs ${matchDetails.teamB || "Team B"}`} />
          <Chip label={`Venue: ${matchDetails.location || "TBD"}`} variant="outlined" />
          <Chip label={`Toss: ${tossDetails.winner || "TBD"}`} variant="outlined" />
          <Chip label={`Decision: ${tossDetails.decision || "TBD"}`} variant="outlined" />
        </Stack>
      </Paper>
      {formError && (
        <Typography color="error" sx={{ mt: 1 }}>
          {formError}
        </Typography>
      )}

      {battingTeam && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 1.5, md: 2 }, height: "100%", border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" gutterBottom>
                Opening players ({battingTeamData?.name || "Batting team"}):
              </Typography>
              <FormControl fullWidth margin="normal">
                <TextField
                  select
                  label="Batsman 1 (Striker)"
                  value={players.batsman1}
                  onChange={(e) =>
                    setplayers({ ...players, batsman1: e.target.value })
                  }
                >
                  {battingPlayers.map((player, index) => (
                    <MenuItem key={index} value={player}>
                      {player}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <TextField
                  select
                  label="Batsman 2 (Non Striker)"
                  value={players.batsman2}
                  onChange={(e) =>
                    setplayers({ ...players, batsman2: e.target.value })
                  }
                >
                  {battingPlayers.map((player, index) => (
                    <MenuItem key={index} value={player}>
                      {player}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: { xs: 1.5, md: 2 }, height: "100%", border: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" gutterBottom>
                Opening Bowler ({bowlingTeamData?.name || "Bowling team"}):
              </Typography>
              <FormControl fullWidth margin="normal">
                <TextField
                  select
                  label="Bowler"
                  value={bowler}
                  onChange={(e) => setBowler(e.target.value)}
                >
                  {bowlingPlayers.map((player, index) => (
                    <MenuItem key={index} value={player}>
                      {player}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            </Paper>
          </Grid>
        </Grid>
      )}

      <AppButton
        onClick={handleStart}
        disabled={isStarting || isSubmitting}
        sx={{ mt: 3, width: { xs: "100%", sm: 320 }, py: 1.3 }}
      >
        {isStarting || isSubmitting ? "Starting..." : "Start Match"}
      </AppButton>
    </Box>
  );
};

export default StartMatch;
