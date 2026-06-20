/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Button,
  Box,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

/**
 * Collects all unique player names from both innings.
 * Returns an array of { name, team } objects.
 */
const collectPlayers = (matchData) => {
  const innings = matchData?.scoreCard?.innings || [];
  const teams = matchData?.teams || {};
  const seen = new Set();
  const players = [];

  innings.forEach((inning) => {
    const teamKey = inning?.team;
    const teamName = teams[teamKey]?.name || teamKey;
    (inning.batsmen || []).forEach((b) => {
      if (b?.name && !seen.has(b.name)) {
        seen.add(b.name);
        players.push({ name: b.name, team: teamName });
      }
    });
    (inning.bowlers || []).forEach((b) => {
      if (b?.name && !seen.has(b.name)) {
        seen.add(b.name);
        players.push({ name: b.name, team: teamName });
      }
    });
  });

  return players;
};

const PlayerOfMatchSelector = ({ open, onClose, matchData, currentPotm, onSave, saving }) => {
  const [selected, setSelected] = useState(currentPotm || "");
  const players = collectPlayers(matchData);

  const handleSave = () => {
    onSave(selected);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <EmojiEventsIcon sx={{ color: "#F59E0B", fontSize: 22 }} />
        Player of the Match
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        {players.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No players found. Scorecard data may be incomplete.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {players.map((player) => (
              <ListItemButton
                key={player.name}
                selected={selected === player.name}
                onClick={() => setSelected(player.name)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "rgba(108, 99, 255, 0.1)",
                    borderLeft: "3px solid",
                    borderColor: "primary.main",
                  },
                }}
              >
                <ListItemText
                  primary={player.name}
                  secondary={player.team}
                  primaryTypographyProps={{ fontWeight: selected === player.name ? 700 : 500 }}
                />
                {selected === player.name && (
                  <Chip
                    size="small"
                    label="Selected"
                    sx={{ bgcolor: "#F59E0B", color: "#fff", fontWeight: 700, fontSize: "0.65rem" }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!selected || saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerOfMatchSelector;
