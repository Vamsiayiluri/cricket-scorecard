import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import PageContainer from "../components/ui/PageContainer";
import AppInput from "../components/ui/AppInput";
import PlayerFormDialog from "../components/players/PlayerFormDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useUserPlayers from "../hooks/firebase/useUserPlayers";
import useCompletedMatches from "../hooks/firebase/useCompletedMatches";
import { createPlayer, deletePlayer, updatePlayer } from "../services/firebase/playerService";
import { computeAllPlayerStats } from "../utils/playerStats";

const ROLE_COLORS = {
  Batsman: "primary",
  Bowler: "success",
  "All-rounder": "secondary",
  "Wicket-keeper": "warning",
};

const PlayersPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { players, loading } = useUserPlayers();
  const { matches } = useCompletedMatches();

  const statsMap = useMemo(() => computeAllPlayerStats(matches), [matches]);

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (player) => { setEditTarget(player); setDialogOpen(true); };
  const closeDialog = () => { if (!saving) { setDialogOpen(false); setEditTarget(null); } };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updatePlayer(editTarget.playerId, formData);
        showToast("Player updated.", "success");
      } else {
        await createPlayer({ ...formData, createdBy: user.uid });
        showToast("Player created.", "success");
      }
      setDialogOpen(false);
      setEditTarget(null);
    } catch {
      showToast("Failed to save player. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (player) => {
    if (!window.confirm(`Delete "${player.name}"? This does not affect existing match scorecards.`)) return;
    try {
      await deletePlayer(player.playerId);
      showToast("Player deleted.", "success");
    } catch {
      showToast("Failed to delete player.", "error");
    }
  };

  return (
    <PageContainer
      title="My Players"
      subtitle="Build your player catalog. Add players to teams and matches without retyping."
    >
      <Stack spacing={2} sx={{ maxWidth: 960 }}>
        {/* Toolbar */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <AppInput
            placeholder="Search by name or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{ borderRadius: 1, flexShrink: 0 }}
          >
            Add Player
          </Button>
        </Stack>

        {/* Summary chip */}
        {!loading && players.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {players.length} player{players.length === 1 ? "" : "s"} in catalog
            {filtered.length !== players.length && ` · ${filtered.length} shown`}
          </Typography>
        )}

        {/* Empty state */}
        {!loading && players.length === 0 && (
          <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderColor: "divider" }}>
            <PersonIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              No players yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add players to your catalog to search them when building teams or creating matches.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 1 }}>
              Add Player
            </Button>
          </Paper>
        )}

        {/* No search results */}
        {!loading && players.length > 0 && filtered.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              No players match &quot;{search}&quot;.
            </Typography>
          </Paper>
        )}

        {/* Player cards */}
        {!loading && filtered.length > 0 && (
          <Grid container spacing={1.5}>
            {filtered.map((player) => (
              <Grid item xs={12} sm={6} md={4} key={player.playerId}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.75,
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "primary.main" },
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/players/${player.playerId}`)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {player.name}
                      </Typography>
                      {player.role && (
                        <Chip
                          size="small"
                          label={player.role}
                          color={ROLE_COLORS[player.role] || "default"}
                          variant="outlined"
                          sx={{ mt: 0.5, height: 18, fontSize: "0.65rem" }}
                        />
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                      <Tooltip title="View profile">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); navigate(`/players/${player.playerId}`); }}
                          sx={{ p: 0.5 }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit player">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(player); }} sx={{ p: 0.5 }}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete player">
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(player); }} sx={{ p: 0.5 }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {(player.battingStyle || player.bowlingStyle) && (
                    <Stack spacing={0.25}>
                      {player.battingStyle && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                          Bat: {player.battingStyle}
                        </Typography>
                      )}
                      {player.bowlingStyle && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                          Bowl: {player.bowlingStyle}
                        </Typography>
                      )}
                    </Stack>
                  )}

                  {/* Stats chips — only shown if player has stats */}
                  {statsMap.has(player.playerId) && (() => {
                    const s = statsMap.get(player.playerId);
                    return (
                      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                        {s.batting.matches > 0 && (
                          <Chip size="small" label={`${s.batting.matches} match${s.batting.matches === 1 ? "" : "es"}`} sx={{ height: 16, fontSize: "0.6rem" }} />
                        )}
                        {s.batting.runs > 0 && (
                          <Chip size="small" label={`${s.batting.runs} runs`} color="primary" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
                        )}
                        {s.bowling.wickets > 0 && (
                          <Chip size="small" label={`${s.bowling.wickets} wkts`} color="success" variant="outlined" sx={{ height: 16, fontSize: "0.6rem" }} />
                        )}
                      </Stack>
                    );
                  })()}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading players…
          </Typography>
        )}
      </Stack>

      <PlayerFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        saving={saving}
        player={editTarget}
        allPlayers={players}
      />
    </PageContainer>
  );
};

export default PlayersPage;
