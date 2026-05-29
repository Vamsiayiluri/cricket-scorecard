/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import AppInput from "../ui/AppInput";
import { MAX_OVERS, MIN_OVERS } from "../../constants/matchCreation";

const ScoringRulesForm = ({ data, errors = {}, onUpdate }) => {
  const [scoringRules, setScoringRules] = useState(
    data || { overs: "", wide: 1, noBall: 1 }
  );

  useEffect(() => {
    setScoringRules(data || { overs: "", wide: 1, noBall: 1 });
  }, [data]);

  const handleChange = (field, value) => {
    const numericFields = ["overs", "wide", "noBall"];
    const parsed = numericFields.includes(field) && value !== "" ? Number(value) : value;
    const updated = { ...scoringRules, [field]: parsed };
    setScoringRules(updated);
    onUpdate(updated);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 620, mx: "auto", px: { xs: 0.5, md: 1 } }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.75 }}>
        Scoring Rules
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Configure overs and extra run penalties.
      </Typography>

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={4}>
          <AppInput
            label="Overs per side *"
            type="number"
            inputProps={{ min: MIN_OVERS, max: MAX_OVERS }}
            value={scoringRules.overs ?? ""}
            onChange={(e) => handleChange("overs", e.target.value)}
            error={Boolean(errors.overs)}
            helperText={errors.overs || `Min ${MIN_OVERS}, Max ${MAX_OVERS}`}
            FormHelperTextProps={{ sx: { fontSize: "0.65rem", mt: 0.25 } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <AppInput
            label="Runs for wide *"
            type="number"
            inputProps={{ min: 0 }}
            value={scoringRules.wide ?? ""}
            onChange={(e) => handleChange("wide", e.target.value)}
            error={Boolean(errors.wide)}
            helperText={errors.wide}
            FormHelperTextProps={{ sx: { fontSize: "0.65rem", mt: 0.25 } }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <AppInput
            label="Runs for no-ball *"
            type="number"
            inputProps={{ min: 0 }}
            value={scoringRules.noBall ?? ""}
            onChange={(e) => handleChange("noBall", e.target.value)}
            error={Boolean(errors.noBall)}
            helperText={errors.noBall}
            FormHelperTextProps={{ sx: { fontSize: "0.65rem", mt: 0.25 } }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ScoringRulesForm;
