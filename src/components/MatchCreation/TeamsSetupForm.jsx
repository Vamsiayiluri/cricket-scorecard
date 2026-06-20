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
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayerSearchInput from "../players/PlayerSearchInput";
import LoadTeamDialog from "../teams/LoadTeamDialog";
import useUserTeams from "../../hooks/firebase/useUserTeams";
import useUserPlayers from "../../hooks/firebase/useUserPlayers";
import { MIN_PLAYERS_PER_TEAM, MAX_PLAYERS_PER_TEAM } from "../../constants/matchCreation";
import { findDuplicatePlayers } from "../../utils/matchCreationValidation";

/**
 * Build initial form state from draft data or saved match form.
 * Restores playerRefs if present; synthesises nulls for manual names otherwise.
 */
const buildInitialTeams = (data, teamData) => {
  const buildTeam = (teamSlot, nameOverride) => {
    const players = teamSlot?.players || [];
    const playerRefs = teamSlot?.playerRefs && teamSlot.playerRefs.length === players.length
      ? teamSlot.playerRefs
      : players.map((name) => ({ playerId: null, name }));
    return {
      name: teamSlot?.name || nameOverride || "",
      players,
      playerRefs,
      captain: teamSlot?.captain || "",
      wicketkeeper: teamSlot?.wicketkeeper || "",
    };
  };

  if (data?.teamA?.players || data?.teamB?.players) {
    return {
      teamA: buildTeam(data.teamA, teamData?.teamA),
      teamB: buildTeam(data.teamB, teamData?.teamB),
    };
  }
  return {
    teamA: buildTeam(null, teamData?.teamA),
    teamB: buildTeam(null, teamData?.teamB),
  };
};

const TeamColumn = ({
  teamKey,
  team,
  displayName,
  errors = {},
  catalogPlayers,
  onTeamChange,
  onAddPlayer,
  onRemovePlayer,
  onLoadTeam,
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
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip
              size="small"
              label={`${team.players.length} player${team.players.length === 1 ? "" : "s"}`}
              color={team.players.length >= MIN_PLAYERS_PER_TEAM ? "success" : "default"}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<FolderOpenIcon sx={{ fontSize: "0.9rem !important" }} />}
              onClick={() => onLoadTeam(teamKey)}
              sx={{ height: 24, fontSize: "0.68rem", px: 1, py: 0, borderRadius: 1, minWidth: 0 }}
            >
              Load
            </Button>
          </Stack>
        </Stack>

        <PlayerSearchInput
          catalogPlayers={catalogPlayers}
          currentNames={team.players}
          onAdd={(name, playerId) => onAddPlayer(teamKey, name, playerId)}
          error={errors.players}
          atMax={team.players.length >= MAX_PLAYERS_PER_TEAM}
        />

        {team.players.length > 0 && (
          <Stack spacing={0.5} sx={{ maxHeight: 200, overflowY: "auto", pr: 0.5 }}>
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
                  {team.playerRefs?.[index]?.playerId && (
                    <Chip size="small" label="linked" sx={{ ml: 0.5, height: 14, fontSize: "0.55rem" }} color="info" />
                  )}
                  {team.captain === player && (
                    <Chip size="small" label="C" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} color="primary" />
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
  const { teams: savedTeams, loading: teamsLoading } = useUserTeams();
  const { players: catalogPlayers } = useUserPlayers();
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [loadTargetKey, setLoadTargetKey] = useState(null);

  const openLoadDialog = (teamKey) => {
    setLoadTargetKey(teamKey);
    setLoadDialogOpen(true);
  };

  const handleLoadTeam = (savedTeam) => {
    if (!loadTargetKey) return;
    const players = savedTeam.players || [];
    const playerRefs = savedTeam.playerRefs && savedTeam.playerRefs.length === players.length
      ? savedTeam.playerRefs
      : players.map((name) => ({ playerId: null, name }));
    const next = {
      ...teams,
      [loadTargetKey]: {
        ...teams[loadTargetKey],
        name: savedTeam.name,
        players,
        playerRefs,
        captain: savedTeam.captain || "",
        wicketkeeper: savedTeam.wicketKeeper || "",
      },
    };
    syncTeams(next);
  };

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
        playerRefs: nextTeams.teamA.playerRefs,
        captain: nextTeams.teamA.captain,
        wicketkeeper: nextTeams.teamA.wicketkeeper,
      },
      teamB: {
        name: nextTeams.teamB.name,
        players: nextTeams.teamB.players,
        playerRefs: nextTeams.teamB.playerRefs,
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

  const addPlayer = (teamKey, name, playerId = null) => {
    if (!name) return;
    const exists = teams[teamKey].players.some(
      (p) => p.toLowerCase() === name.toLowerCase()
    );
    if (exists) return;
    const next = {
      ...teams,
      [teamKey]: {
        ...teams[teamKey],
        players: [...teams[teamKey].players, name],
        playerRefs: [...(teams[teamKey].playerRefs || []), { playerId: playerId || null, name }],
      },
    };
    syncTeams(next);
  };

  const removePlayer = (teamKey, index) => {
    const removed = teams[teamKey].players[index];
    const next = {
      ...teams,
      [teamKey]: {
        ...teams[teamKey],
        players: teams[teamKey].players.filter((_, i) => i !== index),
        playerRefs: (teams[teamKey].playerRefs || []).filter((_, i) => i !== index),
        captain: teams[teamKey].captain === removed ? "" : teams[teamKey].captain,
        wicketkeeper: teams[teamKey].wicketkeeper === removed ? "" : teams[teamKey].wicketkeeper,
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
        Search your player catalog or type any name. Click <strong>Load</strong> to import a saved team.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TeamColumn
            teamKey="teamA"
            team={teams.teamA}
            displayName={names.teamA || "Team A"}
            errors={teamAErrors}
            catalogPlayers={catalogPlayers}
            onTeamChange={handleTeamChange}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onLoadTeam={openLoadDialog}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TeamColumn
            teamKey="teamB"
            team={teams.teamB}
            displayName={names.teamB || "Team B"}
            errors={teamBErrors}
            catalogPlayers={catalogPlayers}
            onTeamChange={handleTeamChange}
            onAddPlayer={addPlayer}
            onRemovePlayer={removePlayer}
            onLoadTeam={openLoadDialog}
          />
        </Grid>
      </Grid>

      <LoadTeamDialog
        open={loadDialogOpen}
        onClose={() => setLoadDialogOpen(false)}
        teams={savedTeams}
        loading={teamsLoading}
        onLoad={handleLoadTeam}
      />
    </Box>
  );
};

export default TeamsSetupForm;
