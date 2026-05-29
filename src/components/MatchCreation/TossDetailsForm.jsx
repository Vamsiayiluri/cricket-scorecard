/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Box, MenuItem, Grid, Typography } from "@mui/material";
import AppInput from "../ui/AppInput";

const TossDetailsForm = ({ data, teamData, errors = {}, onUpdate }) => {
  const teamAName = teamData?.teamA?.name || teamData?.teamA || "";
  const teamBName = teamData?.teamB?.name || teamData?.teamB || "";

  const [tossDetails, setTossDetails] = useState(data || { winner: "", decision: "" });

  useEffect(() => {
    setTossDetails(data || { winner: "", decision: "" });
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...tossDetails, [field]: value };
    setTossDetails(updated);
    onUpdate(updated);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 620, mx: "auto", px: { xs: 0.5, md: 1 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
        Toss
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Record who won the toss and what they chose to do.
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <AppInput
            select
            label="Toss Winner *"
            value={tossDetails.winner || ""}
            onChange={(e) => handleChange("winner", e.target.value)}
            error={Boolean(errors.winner)}
            helperText={errors.winner}
            disabled={!teamAName || !teamBName}
            FormHelperTextProps={{ sx: { fontSize: "0.65rem", mt: 0.25 } }}
          >
            {teamAName && <MenuItem value={teamAName} sx={{ fontSize: "0.85rem" }}>{teamAName}</MenuItem>}
            {teamBName && <MenuItem value={teamBName} sx={{ fontSize: "0.85rem" }}>{teamBName}</MenuItem>}
          </AppInput>
        </Grid>
        <Grid item xs={12} sm={6}>
          <AppInput
            select
            label="Decision *"
            value={tossDetails.decision || ""}
            onChange={(e) => handleChange("decision", e.target.value)}
            error={Boolean(errors.decision)}
            helperText={errors.decision}
            FormHelperTextProps={{ sx: { fontSize: "0.65rem", mt: 0.25 } }}
          >
            <MenuItem value="Bat" sx={{ fontSize: "0.85rem" }}>Bat</MenuItem>
            <MenuItem value="Bowl" sx={{ fontSize: "0.85rem" }}>Bowl</MenuItem>
          </AppInput>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TossDetailsForm;
