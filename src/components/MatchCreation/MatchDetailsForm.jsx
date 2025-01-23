import React, { useEffect, useState } from "react";
import { TextField, Box, Stack } from "@mui/material";

const MatchDetailsForm = ({ data, onUpdate }) => {
  const [matchDetails, setMatchDetails] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...matchDetails, [name]: value };
    setMatchDetails(updatedDetails);
    onUpdate(updatedDetails);
  };

  return (
    <Box>
      <Stack width="400px">
        <TextField
          label="Team A Name"
          name="teamA"
          value={matchDetails.teamA || ""}
          onChange={handleChange}
          margin="normal"
          fullWidth
        />
        <TextField
          label="Team B Name"
          name="teamB"
          value={matchDetails.teamB || ""}
          onChange={handleChange}
          margin="normal"
          fullWidth
        />
        <TextField
          label="Match Date & Time"
          name="dateTime"
          type="datetime-local"
          value={matchDetails.dateTime || ""}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
        />

        <TextField
          label="Venue"
          name="venue"
          value={matchDetails.venue || ""}
          onChange={handleChange}
          margin="normal"
          fullWidth
        />
      </Stack>
    </Box>
  );
};

export default MatchDetailsForm;
