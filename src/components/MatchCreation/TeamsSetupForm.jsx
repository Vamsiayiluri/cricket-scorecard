/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AppInput from "../ui/AppInput";
import { MIN_PLAYERS_PER_TEAM } from "../../constants/matchCreation";
import { findDuplicatePlayers } from "../../utils/matchCreationValidation";

const buildInitialTeams = (data, teamData) => {
  if (data?.teamA?.players || data?.teamB?.players) {
    return {
      teamA: {
        name: data.teamA?.name || teamData?.teamA || "",
        players: data.teamA?.players || [],
        captain: data.teamA?.captain || "",
        wicketkeeper: data.teamA?.wicketkeeper || "",
        newPlayer: "",
      },
      teamB: {
        name: data.teamB?.name || teamData?.teamB || "",
        players: data.teamB?.players || [],
        captain: data.teamB?.captain || "",
        wicketkeeper: data.teamB?.wicketkeeper || "",
        newPlayer: "",
      },
    };
  }
  return {
    teamA: {
      name: teamData?.teamA || "",
      players: [],
      captain: "",
      wicketkeeper: "",
      newPlayer: "",
    },
    teamB: {
      name: teamData?.teamB || "",
      players: [],
      captain: "",
      wicketkeeper: "",
      newPlayer: "",
    },
  };
};

const TeamColumn = ({
  teamKey,
  team,
  displayName,
  errors = {},
  onTeamChange,
  onAddPlayer,
  onRemovePlayer,
}) => {
  const duplicates = findDuplicatePlayers(team.players);

  return (
    <Box
      sx={{
        p: 1.5,
        height: "100%",
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {displayName}
          </Typography>
          <Chip
            size="small"
            label={`${team.players.length} player${team.players.length === 1 ? "" : "s"}`}
            color={team.players.length >= MIN_PLAYERS_PER_TEAM ? "success" : "default"}
            variant="outlined"
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        </Stack>

        <Stack direction="row" spacing={1}>
          <AppInput
            label="Add player"
            placeholder="Player name"
            value={team.newPlayer || ""}
            onChange={(e) => onTeamChange(teamKey, "newPlayer", e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAddPlayer(teamKey);
              }
            }}
            error={Boolean(errors.players)}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => onAddPlayer(teamKey)}
            sx={{ minHeight: 38, flexShrink: 0, borderRadius: 1 }}
          >
            Add
          </Button>
        </Stack>
        {errors.players && <FormHelperText error sx={{ mt: 0.25, fontSize: "0.675rem" }}>{errors.players}</FormHelperText>}

        {team.players.length > 0 && (
          <Stack spacing={0.5} sx={{ maxH: 200, overflowY: "auto", pr: 0.5 }}>
            {team.players.map((player, index) => (
              <Box
                key={`${player}-${index}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 0.5,
                  px: 1,
                  borderRadius: 0.5,
                  bgcolor: duplicates.includes(player)
                    ? "error.light"
                    : (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.025)"
                          : "rgba(15,23,42,0.025)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.86rem" }}>
                  {player}
                  {team.captain === player && (
                    <Chip size="small" label="C" sx={{ ml: 1, height: 16, fontSize: "0.6rem" }} color="primary" />
                  )}
                  {team.wicketkeeper === player && (
                    <Chip size="small" label="WK" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} color="secondary" />
                  )}
                </Typography>
                <IconButton size="small" color="error" onClick={() => onRemovePlayer(teamKey, index)} aria-label="Remove player" sx={{ p: 0.25 }}>
                  <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        {team.players.length >= MIN_PLAYERS_PER_TEAM && (
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small" error={Boolean(errors.captain)}>
              <InputLabel sx={{ fontSize: "0.9rem", fontWeight: 700 }}>Captain</InputLabel>
              <Select
                label="Captain"
                value={team.captain || ""}
                onChange={(e) => onTeamChange(teamKey, "captain", e.target.value)}
                sx={{ fontSize: "0.9rem" }}
              >
                <MenuItem value="" sx={{ fontSize: "0.8rem" }}>
                  <em>None</em>
                </MenuItem>
                {team.players.map((player) => (
                  <MenuItem key={player} value={player} sx={{ fontSize: "0.8rem" }}>
                    {player}
                  </MenuItem>
                ))}
              </Select>
              {errors.captain && <FormHelperText sx={{ fontSize: "0.65rem" }}>{errors.captain}</FormHelperText>}
            </FormControl>

            <FormControl fullWidth size="small" error={Boolean(errors.wicketkeeper)}>
              <InputLabel sx={{ fontSize: "0.9rem", fontWeight: 700 }}>Wicketkeeper</InputLabel>
              <Select
                label="Wicketkeeper"
                value={team.wicketkeeper || ""}
                onChange={(e) => onTeamChange(teamKey, "wicketkeeper", e.target.value)}
                sx={{ fontSize: "0.9rem" }}
              >
                <MenuItem value="" sx={{ fontSize: "0.8rem" }}>
                  <em>None</em>
                </MenuItem>
                {team.players.map((player) => (
                  <MenuItem key={player} value={player} sx={{ fontSize: "0.8rem" }}>
                    {player}
                  </MenuItem>
                ))}
              </Select>
              {errors.wicketkeeper && <FormHelperText sx={{ fontSize: "0.65rem" }}>{errors.wicketkeeper}</FormHelperText>}
            </FormControl>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

const TeamsSetupForm = ({ data, teamData, errors = {}, onUpdate }) => {
  const [teams, setTeams] = useState(() => buildInitialTeams(data, teamData));

  useEffect(() => {
    setTeams((prev) => ({
      teamA: { ...prev.teamA, name: teamData?.teamA || prev.teamA.name },
      teamB: { ...prev.teamB, name: teamData?.teamB || prev.teamB.name },
    }));
  }, [teamData?.teamA, teamData?.teamB]);

  const syncTeams = (nextTeams) => {
    setTeams(nextTeams);
    onUpdate({
      teamA: {
        name: nextTeams.teamA.name,
        players: nextTeams.teamA.players,
        captain: nextTeams.teamA.captain,
        wicketkeeper: nextTeams.teamA.wicketkeeper,
      },
      teamB: {
        name: nextTeams.teamB.name,
        players: nextTeams.teamB.players,
        captain: nextTeams.teamB.captain,
        wicketkeeper: nextTeams.teamB.wicketkeeper,
      },
    });
  };

  const handleTeamChange = (teamKey, field, value) => {
    const next = {
      ...teams,
      [teamKey]: { ...teams[teamKey], [field]: value },
    };
    syncTeams(next);
  };

  const addPlayer = (teamKey) => {
    const name = (teams[teamKey].newPlayer || "").trim();
    if (!name) {
      return;
    }
    const exists = teams[teamKey].players.some(
      (p) => p.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      return;
    }
    const next = {
      ...teams,
      [teamKey]: {
        ...teams[teamKey],
        players: [...teams[teamKey].players, name],
        newPlayer: "",
      },
    };
    syncTeams(next);
  };

  const removePlayer = (teamKey, index) => {
    const removed = teams[teamKey].players[index];
    const nextPlayers = teams[teamKey].players.filter((_, i) => i !== index);
    const next = {
      ...teams,
      [teamKey]: {
        ...teams[teamKey],
        players: nextPlayers,
        captain: teams[teamKey].captain === removed ? "" : teams[teamKey].captain,
        wicketkeeper:
          teams[teamKey].wicketkeeper === removed ? "" : teams[teamKey].wicketkeeper,
      },
    };
    syncTeams(next);
  };

  const teamAErrors = errors.teamA || {};
  const teamBErrors = errors.teamB || {};

  const names = useMemo(
    () => ({
      teamA: teamData?.teamA || teams.teamA.name,
      teamB: teamData?.teamB || teams.teamB.name,
    }),
    [teamData, teams.teamA.name, teams.teamB.name]
  );

  return (
    <Box sx={{ width: "100%", maxWidth: 960, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
        Teams & Playing XI
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.9rem" }}>
        Add at least {MIN_PLAYERS_PER_TEAM} players per team. Duplicates are blocked automatically.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TeamColumn
            teamKey="teamA"
            team={teams.teamA}
            displayName={names.teamA || "Team A"}
            errors={teamAErrors}
            onTeamChange={handleTeamChange}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TeamColumn
            teamKey="teamB"
            team={teams.teamB}
            displayName={names.teamB || "Team B"}
            errors={teamBErrors}
            onTeamChange={handleTeamChange}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeamsSetupForm;
