/* eslint-disable react/prop-types */
import { memo } from "react";
import {
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  AlertTitle
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import AppButton from "../ui/AppButton";
import { validateAllSteps } from "../../utils/matchCreationValidation";

const PreviewSection = ({ title, stepIndex, onEdit, children }) => (
  <Box sx={{ p: 1.75, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>{title}</Typography>
      {typeof onEdit === "function" && (
        <AppButton size="small" variant="text" onClick={() => onEdit(stepIndex)} sx={{ minHeight: 30, py: 0.5, px: 1 }}>
          Edit
        </AppButton>
      )}
    </Stack>
    <Divider sx={{ mb: 1.25, borderColor: "divider" }} />
    {children}
  </Box>
);

const flattenValidationErrors = (errors = {}) => {
  const messages = [];
  Object.entries(errors).forEach(([section, value]) => {
    if (typeof value === "string") {
      messages.push(`${section}: ${value}`);
      return;
    }
    Object.values(value || {}).forEach((nested) => {
      if (typeof nested === "string") {
        messages.push(nested);
      } else {
        Object.values(nested || {}).forEach((message) => {
          if (typeof message === "string") {
            messages.push(message);
          }
        });
      }
    });
  });
  return messages;
};

const PreviewMatch = memo(({ data, onEditStep, isSubmitting }) => {
  const {
    matchDetails = {},
    teams = {},
    tossDetails = {},
    scoringRules = {},
    notes = "",
  } = data;

  const validation = validateAllSteps(data);
  const validationMessages = flattenValidationErrors(validation.errors);
  const displayTitle =
    matchDetails.matchTitle?.trim() ||
    `${matchDetails.teamA || "Team A"} vs ${matchDetails.teamB || "Team B"}`;

  const renderTeamPreview = (team, fallbackName) => {
    const players = team?.players || [];
    return (
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {team?.name || fallbackName}
        </Typography>
        {team?.captain && <Chip size="small" label={`Captain: ${team.captain}`} sx={{ mr: 0.5, mb: 1 }} />}
        {team?.wicketkeeper && (
          <Chip size="small" label={`WK: ${team.wicketkeeper}`} sx={{ mb: 1 }} />
        )}
        <List dense disablePadding>
          {players.map((player) => (
            <ListItem key={player} disableGutters sx={{ py: 0.25 }}>
              <ListItemText primary={player} />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <Stack spacing={1.5} sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
      <Typography variant="h2" sx={{ textAlign: "center", fontWeight: 800 }}>
        Review & Confirm
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", display: "block" }}>
        Check all configurations before initializing the match.
      </Typography>

      {validation.valid ? (
        <Alert severity="success" icon={<CheckCircleIcon sx={{ fontSize: 18 }} />} sx={{ py: 0.5, borderRadius: 1, fontSize: "0.8rem", alignItems: "center" }}>
          All required sections are complete. Ready to create match.
        </Alert>
      ) : (
        <Alert severity="warning" icon={<ErrorIcon sx={{ fontSize: 18 }} />} sx={{ py: 0.5, borderRadius: 1, fontSize: "0.8rem", alignItems: "center" }}>
          <AlertTitle sx={{ fontSize: "0.85rem", fontWeight: 800, mb: 0.5 }}>
            Some sections need attention
          </AlertTitle>
          <List dense disablePadding>
            {validationMessages.slice(0, 4).map((message) => (
              <ListItem key={message} disableGutters sx={{ py: 0 }}>
                <ListItemText primary={message} primaryTypographyProps={{ variant: "caption" }} />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      <PreviewSection title="Match" stepIndex={0} onEdit={onEditStep}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          {displayTitle}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Type: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{matchDetails.matchType || "—"}</Box></Typography>
          <Typography variant="body2" color="text.secondary">Venue: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{matchDetails.venue || "—"}</Box></Typography>
          <Typography variant="body2" color="text.secondary">Date: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{matchDetails.dateTime || "—"}</Box></Typography>
        </Stack>
      </PreviewSection>

      <PreviewSection title="Teams & Playing XI" stepIndex={1} onEdit={onEditStep}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderTeamPreview(teams.teamA, matchDetails.teamA)}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderTeamPreview(teams.teamB, matchDetails.teamB)}
          </Grid>
        </Grid>
      </PreviewSection>

      <PreviewSection title="Toss" stepIndex={2} onEdit={onEditStep}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Winner: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{tossDetails.winner || "—"}</Box></Typography>
          <Typography variant="body2" color="text.secondary">Decision: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{tossDetails.decision || "—"}</Box></Typography>
        </Stack>
      </PreviewSection>

      <PreviewSection title="Scoring Rules" stepIndex={3} onEdit={onEditStep}>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">Overs per side: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{scoringRules.overs ?? "—"}</Box></Typography>
          <Typography variant="body2" color="text.secondary">Wide: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{scoringRules.wide ?? "—"} run(s)</Box></Typography>
          <Typography variant="body2" color="text.secondary">No-ball: <Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>{scoringRules.noBall ?? "—"} run(s)</Box></Typography>
        </Stack>
      </PreviewSection>

      <PreviewSection title="Notes" stepIndex={4} onEdit={onEditStep}>
        <Typography variant="body2" color="text.primary" sx={{ fontStyle: notes?.trim() ? "normal" : "italic" }}>
          {notes?.trim() ? notes : "No additional notes"}
        </Typography>
      </PreviewSection>

      {isSubmitting && (
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", display: "block" }}>
          Creating match…
        </Typography>
      )}
    </Stack>
  );
});

PreviewMatch.displayName = "PreviewMatch";

export default PreviewMatch;
