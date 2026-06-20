/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import AppDialog from "../ui/AppDialog";
import AppInput from "../ui/AppInput";
import {
  TOURNAMENT_FORMATS,
  TOURNAMENT_STATUS,
} from "../../services/firebase/tournamentService";

const STATUS_OPTIONS = Object.values(TOURNAMENT_STATUS);

const EMPTY_FORM = {
  name: "",
  description: "",
  format: "League",
  status: TOURNAMENT_STATUS.DRAFT,
  startDate: "",
  endDate: "",
  isPublic: true,
};

const buildForm = (tournament) => {
  if (!tournament) return EMPTY_FORM;
  return {
    name: tournament.name || "",
    description: tournament.description || "",
    format: tournament.format || "League",
    status: tournament.status || TOURNAMENT_STATUS.DRAFT,
    startDate: tournament.startDate || "",
    endDate: tournament.endDate || "",
    isPublic: tournament.isPublic ?? true,
  };
};

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "Tournament name is required.";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date must be on or after start date.";
  }
  return errors;
};

const TournamentFormDialog = ({ open, onClose, onSave, tournament = null, saving = false }) => {
  const isEdit = Boolean(tournament);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildForm(tournament));
      setErrors({});
    }
  }, [open, tournament]);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(form);
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Tournament" : "Create Tournament"}
      maxWidth="sm"
      actions={[
        { label: "Cancel", onClick: onClose, variant: "outlined", disabled: saving },
        {
          label: isEdit ? "Save Changes" : "Create Tournament",
          onClick: handleSave,
          variant: "contained",
          loading: saving,
          disabled: saving,
        },
      ]}
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <AppInput
          label="Tournament Name *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          error={Boolean(errors.name)}
          helperText={errors.name}
          fullWidth
          autoFocus
          placeholder="e.g. Summer Club Championship 2026"
        />

        <AppInput
          label="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          multiline
          rows={2}
          fullWidth
          placeholder="Optional details about the tournament..."
        />

        <FormControl fullWidth size="small">
          <InputLabel>Format</InputLabel>
          <Select
            label="Format"
            value={form.format}
            onChange={(e) => set("format", e.target.value)}
          >
            {TOURNAMENT_FORMATS.map((f) => (
              <MenuItem key={f.value} value={f.value}>
                {f.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <AppInput
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <AppInput
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
          />
        </Stack>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={Boolean(form.isPublic)}
              onChange={(e) => set("isPublic", e.target.checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {form.isPublic ? "Public tournament (visible to all)" : "Private tournament"}
            </Typography>
          }
        />
      </Stack>
    </AppDialog>
  );
};

export default TournamentFormDialog;
