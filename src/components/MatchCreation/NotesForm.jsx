/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Box, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import AppInput from "../ui/AppInput";

const NotesForm = ({ data, isPublic = true, onUpdate, onUpdateVisibility }) => {
  const [notes, setNotes] = useState(data || "");

  useEffect(() => {
    setNotes(data || "");
  }, [data]);

  return (
    <Box sx={{ width: "100%", maxWidth: 620, mx: "auto", px: { xs: 0.5, md: 1 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
        Notes & Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Optional details for scorers and viewers (umpires, pitch notes, etc.).
      </Typography>
      <Stack spacing={1.5}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={Boolean(isPublic)}
              onChange={(e) => onUpdateVisibility?.(e.target.checked)}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {isPublic ? "Public match (shareable)" : "Private match (restricted)"}
            </Typography>
          }
        />
        <AppInput
          label="Additional notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            onUpdate(e.target.value);
          }}
          multiline
          rows={3}
          placeholder="e.g. Powerplay overs, local rules, rain policy..."
        />
      </Stack>
    </Box>
  );
};

export default NotesForm;
