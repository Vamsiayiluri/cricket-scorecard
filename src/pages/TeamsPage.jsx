import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
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
import GroupsIcon from "@mui/icons-material/Groups";
import SearchIcon from "@mui/icons-material/Search";
import PageContainer from "../components/ui/PageContainer";
import AppInput from "../components/ui/AppInput";
import TeamFormDialog from "../components/teams/TeamFormDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useUserTeams from "../hooks/firebase/useUserTeams";
import { createTeam, deleteTeam, updateTeam } from "../services/firebase/teamService";

const TeamsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { teams, loading } = useUserTeams();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (team) => { setEditTarget(team); setDialogOpen(true); };
  const closeDialog = () => { if (!saving) { setDialogOpen(false); setEditTarget(null); } };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updateTeam(editTarget.teamId, formData);
        showToast("Team updated.", "success");
      } else {
        await createTeam({ ...formData, createdBy: user.uid });
        showToast("Team created.", "success");
      }
      setDialogOpen(false);
      setEditTarget(null);
    } catch {
      showToast("Failed to save team. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team) => {
    if (!window.confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
    try {
      await deleteTeam(team.teamId);
      showToast("Team deleted.", "success");
    } catch {
      showToast("Failed to delete team.", "error");
    }
  };

  return (
    <PageContainer
      title="My Teams"
      subtitle="Create reusable teams and load them instantly when creating a match."
    >
      <Stack spacing={2} sx={{ maxWidth: 960 }}>
        {/* Toolbar */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <AppInput
            placeholder="Search teams…"
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
            Create Team
          </Button>
        </Stack>

        {/* Empty state */}
        {!loading && teams.length === 0 && (
          <Paper
            variant="outlined"
            sx={{ p: 4, textAlign: "center", borderColor: "divider" }}
          >
            <GroupsIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              No teams yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first reusable team to skip re-entering players every match.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 1 }}>
              Create Team
            </Button>
          </Paper>
        )}

        {/* No search results */}
        {!loading && teams.length > 0 && filtered.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary">
              No teams match &quot;{search}&quot;.
            </Typography>
          </Paper>
        )}

        {/* Team cards */}
        {!loading && filtered.length > 0 && (
          <Grid container spacing={2}>
            {filtered.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team.teamId}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    height: "100%",
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "primary.main" },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h4" sx={{ fontWeight: 800, wordBreak: "break-word", mr: 1 }}>
                      {team.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <Tooltip title="Edit team">
                        <IconButton size="small" onClick={() => openEdit(team)} sx={{ p: 0.5 }}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete team">
                        <IconButton size="small" color="error" onClick={() => handleDelete(team)} sx={{ p: 0.5 }}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
                    <Chip
                      size="small"
                      label={`${team.players?.length ?? 0} players`}
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                    {team.captain && (
                      <Chip
                        size="small"
                        label={`C: ${team.captain}`}
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                    {team.wicketKeeper && (
                      <Chip
                        size="small"
                        label={`WK: ${team.wicketKeeper}`}
                        color="secondary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    )}
                  </Stack>

                  {team.players?.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.5 }}>
                          SQUAD
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: "0.8rem", lineHeight: 1.7, color: "text.secondary" }}>
                          {team.players.slice(0, 8).join(" · ")}
                          {team.players.length > 8 && (
                            <Typography component="span" variant="caption" color="text.disabled">
                              {" "}+{team.players.length - 8} more
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {loading && (
          <Typography variant="body2" color="text.secondary">
            Loading teams…
          </Typography>
        )}
      </Stack>

      <TeamFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        saving={saving}
        team={editTarget}
        allTeams={teams}
      />
    </PageContainer>
  );
};

export default TeamsPage;
