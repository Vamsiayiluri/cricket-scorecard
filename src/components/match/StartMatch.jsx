import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { useLocation } from "react-router-dom";

const StartMatch = ({ matchData, onStart }) => {
  //   let matchData = {};
  const getBattingTeam = () => {
    if (matchData.tossDetails.winner === matchData.teams.teamA.name) {
      if (matchData.tossDetails.decision === "Bat") {
        return "teamA";
      } else {
        return "teamB";
      }
    } else if (matchData.tossDetails.winner === matchData.teams.teamB.name) {
      if (matchData.tossDetails.decision === "Bat") {
        return "teamB";
      } else {
        return "teamA";
      }
    }
  };
  if (matchData.tossDetails.winner === matchData.teams.teamA.name) {
    if (matchData.tossDetails.decision === "bat") {
    }
  }
  const [battingTeam, setBattingTeam] = useState(getBattingTeam());
  console.log(battingTeam, "team");
  const [players, setplayers] = useState({ batsman1: "", batsman2: "" });
  const [bowler, setBowler] = useState("");

  const bowlingTeam = battingTeam === "teamA" ? "teamB" : "teamA";

  const handleStart = () => {
    if (!battingTeam || !players.batsman1 || !players.batsman2 || !bowler) {
      alert("Please select the batting team, opening players, and bowler.");
      return;
    }

    const updatedMatchData = {
      ...matchData,
      status: "in-progress",
      scoreCard: {
        currentInning: 1,
        innings: [
          {
            team: battingTeam,
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
          },
        ],

        currentBowler: { name: bowler, overs: 0, runs: 0, wickets: 0 },
      },
      updatedAt: new Date(),
    };

    onStart(updatedMatchData);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Start Match
      </Typography>
      <Typography>{`Match: ${matchData.matchDetails.name}`}</Typography>
      <Typography>{`Location: ${matchData.matchDetails.location}`}</Typography>
      <Typography>{`Toss Winner: ${matchData.tossDetails.winner}`}</Typography>
      <Typography>{`Decision: ${matchData.tossDetails.decision}`}</Typography>

      {battingTeam && (
        <Box mt={3}>
          <Stack width="300px">
            <Typography variant="h6" gutterBottom>
              Opening players ({matchData.teams[battingTeam].name}):
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
                {matchData.teams[battingTeam].players.map((player, index) => (
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
                {matchData.teams[battingTeam].players.map((player, index) => (
                  <MenuItem key={index} value={player}>
                    {player}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Stack>
        </Box>
      )}

      {battingTeam && (
        <Box mt={3}>
          <Stack width="300px">
            <Typography variant="h6" gutterBottom>
              Opening Bowler ({matchData.teams[bowlingTeam].name}):
            </Typography>
            <FormControl fullWidth margin="normal">
              <TextField
                select
                label="Bowler"
                value={bowler}
                onChange={(e) => setBowler(e.target.value)}
              >
                {matchData.teams[bowlingTeam].players.map((player, index) => (
                  <MenuItem key={index} value={player}>
                    {player}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </Stack>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleStart}
        sx={{ mt: 3 }}
      >
        Start Match
      </Button>
    </Box>
  );
};

export default StartMatch;
