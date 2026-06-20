/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import AppDialog from "../ui/AppDialog";
import AppInput from "../ui/AppInput";

const EMPTY_FORM = { teamAName: "", teamBName: "", scheduledDate: "" };

const buildForm = (fixture) => {
  if (!fixture) return EMPTY_FORM;
  return {
    teamAName: fixture.teamAName || "",
    teamBName: fixture.teamBName || "",
    scheduledDate: fixture.scheduledDate || "",
  };
};

const validate = (form) => {
  const errors = {};
  if (!form.teamAName) errors.teamAName = "Select Team A.";
  if (!form.teamBName) errors.teamBName = "Select Team B.";
  if (form.teamAName && form.teamBName && form.teamAName === form.teamBName) {
    errors.teamBName = "Team B must be different from Team A.";
  }
  return errors;
};

const FixtureFormDialog = ({
  open,
  onClose,
  onSave,
  fixture = null,
  assignedTeams = [],
  saving = false,
}) => {
  const isEdit = Boolean(fixture);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(buildForm(fixture));
      setErrors({});
    }
  }, [open, fixture]);

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

  const teamNames = assignedTeams.map((t) => t.name).filter(Boolean);

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Fixture" : "Add Fixture"}
      maxWidth="xs"
      actions={[
        { label: "Cancel", onClick: onClose, variant: "outlined", disabled: saving },
        {
          label: isEdit ? "Save Changes" : "Add Fixture",
          onClick: handleSave,
          variant: "contained",
          loading: saving,
          disabled: saving,
        },
      ]}
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <FormControl fullWidth size="small" error={Boolean(errors.teamAName)}>
          <InputLabel>Team A *</InputLabel>
          <Select
            label="Team A *"
            value={form.teamAName}
            onChange={(e) => set("teamAName", e.target.value)}
          >
            {teamNames.length === 0 ? (
              <MenuItem disabled value="">
                No teams assigned to tournament
              </MenuItem>
            ) : (
              teamNames.map((name) => (
                <MenuItem key={name} value={name} disabled={name === form.teamBName}>
                  {name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.teamAName && (
            <span style={{ fontSize: "0.72rem", color: "#f44336", marginTop: 4, marginLeft: 14 }}>
              {errors.teamAName}
            </span>
          )}
        </FormControl>

        <FormControl fullWidth size="small" error={Boolean(errors.teamBName)}>
          <InputLabel>Team B *</InputLabel>
          <Select
            label="Team B *"
            value={form.teamBName}
            onChange={(e) => set("teamBName", e.target.value)}
          >
            {teamNames.length === 0 ? (
              <MenuItem disabled value="">
                No teams assigned to tournament
              </MenuItem>
            ) : (
              teamNames.map((name) => (
                <MenuItem key={name} value={name} disabled={name === form.teamAName}>
                  {name}
                </MenuItem>
              ))
            )}
          </Select>
          {errors.teamBName && (
            <span style={{ fontSize: "0.72rem", color: "#f44336", marginTop: 4, marginLeft: 14 }}>
              {errors.teamBName}
            </span>
          )}
        </FormControl>

        <AppInput
          label="Scheduled Date"
          type="date"
          value={form.scheduledDate}
          onChange={(e) => set("scheduledDate", e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
    </AppDialog>
  );
};

export default FixtureFormDialog;
