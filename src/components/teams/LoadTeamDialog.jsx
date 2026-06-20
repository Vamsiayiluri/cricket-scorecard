/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AppDialog from "../ui/AppDialog";

const LoadTeamDialog = ({ open, onClose, teams, loading, onLoad }) => {
  const actions = (
    <Button onClick={onClose} sx={{ borderRadius: 1 }}>
      Cancel
    </Button>
  );

  return (
    <AppDialog open={open} onClose={onClose} title="Load Saved Team" actions={actions} maxWidth="xs">
      {loading && (
        <Typography variant="body2" color="text.secondary">
          Loading teams…
        </Typography>
      )}

      {!loading && teams.length === 0 && (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <GroupsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No saved teams yet.
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Go to <strong>My Teams</strong> to create a reusable team.
          </Typography>
        </Box>
      )}

      {!loading && teams.length > 0 && (
        <List disablePadding>
          {teams.map((team) => (
            <ListItemButton
              key={team.teamId}
              onClick={() => { onLoad(team); onClose(); }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                border: "1px solid",
                borderColor: "divider",
                "&:hover": { borderColor: "primary.main", bgcolor: "rgba(108,99,255,0.06)" },
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {team.name}
                    </Typography>
                    {team.captain && (
                      <Chip size="small" label={`C: ${team.captain}`} sx={{ height: 18, fontSize: "0.65rem" }} />
                    )}
                    {team.wicketKeeper && (
                      <Chip size="small" label={`WK: ${team.wicketKeeper}`} sx={{ height: 18, fontSize: "0.65rem" }} color="secondary" />
                    )}
                  </Stack>
                }
                secondary={`${team.players?.length ?? 0} player${(team.players?.length ?? 0) === 1 ? "" : "s"}`}
                secondaryTypographyProps={{ fontSize: "0.75rem" }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </AppDialog>
  );
};

export default LoadTeamDialog;
