/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  Button,
  DialogContentText,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import AppDialog from "../ui/AppDialog";
import AppInput from "../ui/AppInput";
import { PLAYER_ROLES, BATTING_STYLES, BOWLING_STYLES } from "../../constants/playerAttributes";

const EMPTY_FORM = { name: "", role: "", battingStyle: "", bowlingStyle: "" };

const buildForm = (player) => {
  if (!player) return EMPTY_FORM;
  return {
    name: player.name || "",
    role: player.role || "",
    battingStyle: player.battingStyle || "",
    bowlingStyle: player.bowlingStyle || "",
  };
};

const validate = (form, allPlayers, editingPlayerId) => {
  const errors = {};
  if (!form.name.trim()) {
    errors.name = "Player name is required.";
  } else {
    const duplicate = allPlayers.some(
      (p) =>
        p.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
        p.playerId !== editingPlayerId
    );
    if (duplicate) errors.name = "You already have a player with this name.";
  }
  return errors;
};

const PlayerFormDialog = ({ open, onClose, onSave, saving, player, allPlayers = [] }) => {
  const isEdit = Boolean(player);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildForm(player));
      setErrors({});
    }
  }, [open, player]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const errs = validate(form, allPlayers, player?.playerId);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({ name: form.name.trim(), role: form.role, battingStyle: form.battingStyle, bowlingStyle: form.bowlingStyle });
  };

  const actions = (
    <>
      <Button onClick={onClose} disabled={saving} sx={{ borderRadius: 1 }}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ borderRadius: 1, minWidth: 100 }}>
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Player"}
      </Button>
    </>
  );

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit — ${player?.name}` : "Create Player"}
      actions={actions}
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <DialogContentText variant="body2">
          {isEdit
            ? "Update player details. Changes do not affect existing match scorecards."
            : "Add a player to your catalog. They can be added to teams and matches."}
        </DialogContentText>

        <AppInput
          label="Player name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          autoFocus
        />

        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontWeight: 700 }}>Role</InputLabel>
          <Select label="Role" value={form.role} onChange={(e) => set("role", e.target.value)}>
            <MenuItem value=""><em>Not specified</em></MenuItem>
            {PLAYER_ROLES.map((r) => (
              <MenuItem key={r} value={r} sx={{ fontSize: "0.875rem" }}>{r}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontWeight: 700 }}>Batting style</InputLabel>
            <Select
              label="Batting style"
              value={form.battingStyle}
              onChange={(e) => set("battingStyle", e.target.value)}
            >
              <MenuItem value=""><em>Not specified</em></MenuItem>
              {BATTING_STYLES.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem" }}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontWeight: 700 }}>Bowling style</InputLabel>
            <Select
              label="Bowling style"
              value={form.bowlingStyle}
              onChange={(e) => set("bowlingStyle", e.target.value)}
            >
              <MenuItem value=""><em>Not specified</em></MenuItem>
              {BOWLING_STYLES.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: "0.875rem" }}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {errors.name && !form.name.trim() && (
          <FormHelperText error>{errors.name}</FormHelperText>
        )}
      </Stack>
    </AppDialog>
  );
};

export default PlayerFormDialog;
