import React, { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Button,
  Typography,
  Stack,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const TeamsSetupForm = ({ data, teamData, onUpdate }) => {
  const matchData =
    Object.keys(data).length === 0
      ? {
          teamA: { name: teamData.teamA, players: [], newPlayer: "" },
          teamB: { name: teamData.teamB, players: [], newPlayer: "" },
        }
      : data;

  const [teams, setTeams] = useState(matchData);

  const handleTeamChange = (teamKey, field, value) => {
    console.log(teamKey, field, value, teams);
    const updatedTeams = {
      ...teams,
      [teamKey]: { ...teams[teamKey], [field]: value },
    };
    console.log(updatedTeams, "yteams");
    setTeams(updatedTeams);
    onUpdate(updatedTeams);
  };
  useEffect(() => {
    const updatedTeams = {
      ...teams,
      ["teamA"]: { ...teams["teamA"], ["newPlayer"]: "" },
    };
    console.log(updatedTeams, "yteams");
    setTeams(updatedTeams);
  }, [teams["teamA"].players]);
  useEffect(() => {
    const updatedTeams = {
      ...teams,
      ["teamB"]: { ...teams["teamB"], ["newPlayer"]: "" },
    };
    console.log(updatedTeams, "yteams");
    setTeams(updatedTeams);
  }, [teams["teamB"].players]);
  const addPlayer = (teamKey) => {
    const newPlayer = teams[teamKey].newPlayer.trim();

    if (newPlayer) {
      const updatedPlayers = [...teams[teamKey].players, newPlayer];

      handleTeamChange(teamKey, "players", updatedPlayers);
    }
  };

  const removePlayer = (teamKey, index) => {
    const updatedPlayers = teams[teamKey].players.filter(
      (_, playerIndex) => playerIndex !== index
    );
    handleTeamChange(teamKey, "players", updatedPlayers);
  };

  return (
    <Box sx={{ marginTop: "32px" }}>
      <Stack direction="row" spacing={2}>
        {["teamA", "teamB"].map((teamKey, idx) => (
          <Box key={teamKey} sx={{ marginBottom: "16px" }}>
            <Typography
              variant="h6"
              sx={{ marginBottom: "16px", textAlign: "center" }}
            >
              {idx === 0 ? teamData.teamA : teamData.teamB}
            </Typography>
            <Stack spacing={3} width="400px">
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Add Player"
                  placeholder="Enter player name"
                  value={teams[teamKey].newPlayer}
                  onChange={(e) =>
                    handleTeamChange(teamKey, "newPlayer", e.target.value)
                  }
                  margin="normal"
                />
                <Button onClick={() => addPlayer(teamKey)} variant="outlined">
                  Add Player
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
      {(teams.teamA?.players || teams.teamB?.players) && (
        <Box sx={{ marginTop: 2, marginBottom: 5 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              {teams.teamA?.players.map((player, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    marginBottom: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "350px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", paddingLeft: "16px" }}
                  >
                    {player || "Player not named"}
                  </Typography>
                  <IconButton
                    onClick={() => removePlayer("teamA", index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              ))}
            </Grid>

            <Grid item xs={12} sm={6}>
              {teams.teamB?.players.map((player, index) => (
                <Card
                  key={index}
                  variant="outlined"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    marginBottom: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "350px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", paddingLeft: "16px" }}
                  >
                    {player || "Player not named"}
                  </Typography>
                  <IconButton
                    onClick={() => removePlayer("teamB", index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Card>
              ))}
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default TeamsSetupForm;
