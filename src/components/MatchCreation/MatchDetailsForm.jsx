/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Box, MenuItem, Grid, Typography } from "@mui/material";
import AppInput from "../ui/AppInput";
import { MATCH_TYPES } from "../../constants/matchCreation";

const MatchDetailsForm = ({ data = {}, errors = {}, onUpdate }) => {
  const [matchDetails, setMatchDetails] = useState(data);

  useEffect(() => {
    setMatchDetails(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...matchDetails, [name]: value };
    setMatchDetails(updatedDetails);
    onUpdate(updatedDetails);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 620, mx: "auto", px: { xs: 0.5, md: 1 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
        Match Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Required fields are marked with *
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12}>
          <AppInput
            label="Match Title (optional)"
            name="matchTitle"
            placeholder="e.g. Weekend League Final"
            value={matchDetails.matchTitle || ""}
            onChange={handleChange}
            helperText="Shown in previews; defaults to team names if empty"
            FormHelperTextProps={{ sx: { fontSize: "0.675rem", mt: 0.25 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AppInput
            label="Team A Name *"
            name="teamA"
            value={matchDetails.teamA || ""}
            onChange={handleChange}
            error={Boolean(errors.teamA)}
            helperText={errors.teamA}
            required
            FormHelperTextProps={{ sx: { fontSize: "0.675rem", mt: 0.25 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AppInput
            label="Team B Name *"
            name="teamB"
            value={matchDetails.teamB || ""}
            onChange={handleChange}
            error={Boolean(errors.teamB)}
            helperText={errors.teamB}
            required
            FormHelperTextProps={{ sx: { fontSize: "0.675rem", mt: 0.25 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <AppInput
            select
            label="Match Type"
            name="matchType"
            value={matchDetails.matchType || "T20"}
            onChange={handleChange}
          >
            {MATCH_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value} sx={{ fontSize: "0.85rem", py: 0.75 }}>
                {type.label}
              </MenuItem>
            ))}
          </AppInput>
        </Grid>
        <Grid item xs={12} sm={6}>
          <AppInput
            label="Match Date & Time *"
            name="dateTime"
            type="datetime-local"
            value={matchDetails.dateTime || ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.dateTime)}
            helperText={errors.dateTime}
            required
            FormHelperTextProps={{ sx: { fontSize: "0.675rem", mt: 0.25 } }}
          />
        </Grid>
        <Grid item xs={12}>
          <AppInput
            label="Venue *"
            name="venue"
            value={matchDetails.venue || ""}
            onChange={handleChange}
            error={Boolean(errors.venue)}
            helperText={errors.venue}
            required
            FormHelperTextProps={{ sx: { fontSize: "0.675rem", mt: 0.25 } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MatchDetailsForm;
