import React, { useState } from "react";
import { Box, FormControl, MenuItem, Stack, TextField } from "@mui/material";

const TossDetailsForm = ({ data, teamData, onUpdate }) => {
  console.log(data, teamData, "data table");
  console.log(teamData.teamA.name, "team a data");
  const teamAName = teamData.teamA.name;
  const teamBName = teamData.teamB.name;

  const [tossDetails, setTossDetails] = useState(
    data || { winner: "", decision: "" }
  );

  const handleChange = (field, value) => {
    const updatedTossDetails = { ...tossDetails, [field]: value };
    setTossDetails(updatedTossDetails);
    onUpdate(updatedTossDetails);
  };

  return (
    <Box>
      <Stack width="400px">
        <FormControl fullWidth margin="normal">
          <TextField
            select
            labelId="toss-winner-label"
            label="Toss Winner"
            value={tossDetails.winner}
            onChange={(e) => handleChange("winner", e.target.value)}
          >
            <MenuItem value={teamAName}>{teamAName}</MenuItem>
            <MenuItem value={teamBName}>{teamBName}</MenuItem>
          </TextField>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            select
            label="Decision"
            labelId="toss-decision-label"
            value={tossDetails.decision}
            onChange={(e) => handleChange("decision", e.target.value)}
          >
            <MenuItem value="Bat">Bat</MenuItem>
            <MenuItem value="Bowl">Bowl</MenuItem>
          </TextField>
        </FormControl>
      </Stack>
    </Box>
  );
};

export default TossDetailsForm;
