import React, { useState } from "react";
import { TextField, Box, Stack } from "@mui/material";

const ScoringRulesForm = ({ data, onUpdate }) => {
  const [scoringRules, setScoringRules] = useState(
    data || { overs: "", wide: "", noBall: "" }
  );

  const handleChange = (field, value) => {
    const updatedScoringRules = { ...scoringRules, [field]: value };
    setScoringRules(updatedScoringRules);
    onUpdate(updatedScoringRules);
  };

  return (
    <Box>
      <Stack width="400px">
        <TextField
          label="Overs Per Side"
          value={scoringRules.overs}
          onChange={(e) => handleChange("overs", e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
        <TextField
          label="Runs for Wide"
          value={scoringRules.wide}
          onChange={(e) => handleChange("wide", e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
        <TextField
          label="Runs for No-Ball"
          value={scoringRules.noBall}
          onChange={(e) => handleChange("noBall", e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
      </Stack>
    </Box>
  );
};

export default ScoringRulesForm;
