/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  DialogContentText,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AppDialog from "../ui/AppDialog";
import AppInput from "../ui/AppInput";
import PlayerSearchInput from "../players/PlayerSearchInput";
import useUserPlayers from "../../hooks/firebase/useUserPlayers";
import { MIN_PLAYERS_PER_TEAM, MAX_PLAYERS_PER_TEAM } from "../../constants/matchCreation";

const EMPTY_FORM = {
  name: "",
  players: [],
  playerRefs: [],
  captain: "",
  wicketKeeper: "",
};

const buildForm = (team) => {
  if (!team) return EMPTY_FORM;
  const players = team.players || [];
  const playerRefs = team.playerRefs && team.playerRefs.length === players.length
    ? team.playerRefs
    : players.map((name) => ({ playerId: null, name }));
  return {
    name: team.name || "",
    players,
    playerRefs,
    captain: team.captain || "",
    wicketKeeper: team.wicketKeeper || "",
  };
};

const validate = (form, editingTeamId, allTeams) => {
  const errors = {};
  if (!form.name.trim()) {
    errors.name = "Team name is required.";
  } else {
    const duplicate = allTeams.some(
      (t) => t.name.trim().toLowerCase() === form.name.trim().toLowerCase() && t.teamId !== editingTeamId
    );
    if (duplicate) errors.name = "You already have a team with this name.";
  }
  if (form.players.length < MIN_PLAYERS_PER_TEAM) {
    errors.players = `Add at least ${MIN_PLAYERS_PER_TEAM} players.`;
  }
  if (!form.captain) {
    errors.captain = "Select a captain.";
  }
  if (!form.wicketKeeper) {
    errors.wicketKeeper = "Select a wicket-keeper.";
  }
  return errors;
};

const TeamFormDialog = ({ open, onClose, onSave, saving, team, allTeams = [] }) => {
  const isEdit = Boolean(team);
  const { players: catalogPlayers } = useUserPlayers();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildForm(team));
      setErrors({});
    }
  }, [open, team]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addPlayer = (name, playerId = null) => {
    if (form.players.length >= MAX_PLAYERS_PER_TEAM) return;
    setForm((prev) => ({
      ...prev,
      players: [...prev.players, name],
      playerRefs: [...prev.playerRefs, { playerId: playerId || null, name }],
    }));
  };

  const removePlayer = (index) => {
    const removed = form.players[index];
    setForm((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index),
      playerRefs: prev.playerRefs.filter((_, i) => i !== index),
      captain: prev.captain === removed ? "" : prev.captain,
      wicketKeeper: prev.wicketKeeper === removed ? "" : prev.wicketKeeper,
    }));
  };

  const handleSave = () => {
    const errs = validate(form, team?.teamId, allTeams);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({
      name: form.name.trim(),
      players: form.players,
      playerRefs: form.playerRefs,
      captain: form.captain,
      wicketKeeper: form.wicketKeeper,
    });
  };

  const actions = (
    <>
      <Button onClick={onClose} disabled={saving} sx={{ borderRadius: 1 }}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 1, minWidth: 100 }}>
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Team"}
      </Button>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit — ${team?.name}` : "Create New Team"}
      actions={actions}
      maxWidth="sm"
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <DialogContentText variant="body2">
          {isEdit
            ? "Update team name, roster, captain, and wicket-keeper."
            : "Enter team details. You can load this team into any future match."}
        </DialogContentText>

        <AppInput
          label="Team name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          autoFocus
        />

        <Divider />

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Players
            </Typography>
            <Chip
              size="small"
              label={`${form.players.length} / ${MAX_PLAYERS_PER_TEAM}`}
              color={form.players.length >= MIN_PLAYERS_PER_TEAM ? "success" : "default"}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          </Stack>

          <PlayerSearchInput
            catalogPlayers={catalogPlayers}
            currentNames={form.players}
            onAdd={addPlayer}
            error={errors.players}
            atMax={form.players.length >= MAX_PLAYERS_PER_TEAM}
          />

          {form.players.length > 0 && (
            <Stack spacing={0.5} sx={{ mt: 1.5, maxHeight: 200, overflowY: "auto", pr: 0.5 }}>
              {form.players.map((player, index) => (
                <Box
                  key={`${player}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.5,
                    px: 1,
                    borderRadius: 0.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.025)"
                        : "rgba(15,23,42,0.025)",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.86rem" }}>
                    {player}
                    {form.playerRefs[index]?.playerId && (
                      <Chip size="small" label="linked" sx={{ ml: 1, height: 14, fontSize: "0.55rem" }} color="info" />
                    )}
                    {form.captain === player && (
                      <Chip size="small" label="C" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} color="primary" />
                    )}
                    {form.wicketKeeper === player && (
                      <Chip size="small" label="WK" sx={{ ml: 0.5, height: 16, fontSize: "0.6rem" }} color="secondary" />
                    )}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removePlayer(index)}
                    sx={{ p: 0.25 }}
                  >
                    <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {form.players.length >= MIN_PLAYERS_PER_TEAM && (
          <>
            <Divider />
            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth size="small" error={Boolean(errors.captain)}>
                <InputLabel sx={{ fontSize: "0.9rem", fontWeight: 700 }}>Captain</InputLabel>
                <Select
                  label="Captain"
                  value={form.captain}
                  onChange={(e) => set("captain", e.target.value)}
                  sx={{ fontSize: "0.9rem" }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {form.players.map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontSize: "0.85rem" }}>{p}</MenuItem>
                  ))}
                </Select>
                {errors.captain && (
                  <FormHelperText sx={{ fontSize: "0.65rem" }}>{errors.captain}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth size="small" error={Boolean(errors.wicketKeeper)}>
                <InputLabel sx={{ fontSize: "0.9rem", fontWeight: 700 }}>Wicket-keeper</InputLabel>
                <Select
                  label="Wicket-keeper"
                  value={form.wicketKeeper}
                  onChange={(e) => set("wicketKeeper", e.target.value)}
                  sx={{ fontSize: "0.9rem" }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {form.players.map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontSize: "0.85rem" }}>{p}</MenuItem>
                  ))}
                </Select>
                {errors.wicketKeeper && (
                  <FormHelperText sx={{ fontSize: "0.65rem" }}>{errors.wicketKeeper}</FormHelperText>
                )}
              </FormControl>
            </Stack>
          </>
        )}
      </Stack>
    </AppDialog>
  );
};

export default TeamFormDialog;
