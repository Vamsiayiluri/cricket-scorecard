import React, { useState } from "react";
import { TextField, Box, Stack } from "@mui/material";

const NotesForm = ({ data, onUpdate }) => {
  const [notes, setNotes] = useState(data || "");

  const handleChange = (value) => {
    setNotes(value);
    onUpdate(value);
  };

  return (
    <Box>
      <Stack width="400px">
        <TextField
          label="Additional Notes"
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
        />
      </Stack>
    </Box>
  );
};

export default NotesForm;
