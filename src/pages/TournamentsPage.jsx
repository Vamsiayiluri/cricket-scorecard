/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PageContainer from "../components/ui/PageContainer";
import AppButton from "../components/ui/AppButton";
import AppInput from "../components/ui/AppInput";
import TournamentFormDialog from "../components/tournament/TournamentFormDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useUserTournaments from "../hooks/firebase/useUserTournaments";
import usePublicTournaments from "../hooks/firebase/usePublicTournaments";
import {
  createTournament,
  TOURNAMENT_STATUS,
} from "../services/firebase/tournamentService";

// ── Status chip colors ────────────────────────────────────────────────────────

const STATUS_COLORS = {
  [TOURNAMENT_STATUS.DRAFT]: { bg: "rgba(100,116,139,0.12)", color: "#64748B" },
  [TOURNAMENT_STATUS.UPCOMING]: { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  [TOURNAMENT_STATUS.LIVE]: { bg: "rgba(239,68,68,0.12)", color: "#EF4444" },
  [TOURNAMENT_STATUS.COMPLETED]: { bg: "rgba(34,197,94,0.12)", color: "#22C55E" },
};

const StatusChip = ({ status }) => {
  const style = STATUS_COLORS[status] || STATUS_COLORS[TOURNAMENT_STATUS.DRAFT];
  return (
    <Chip
      size="small"
      label={status || "Draft"}
      sx={{
        height: 20,
        fontSize: "0.65rem",
        fontWeight: 800,
        bgcolor: style.bg,
        color: style.color,
      }}
    />
  );
};

// ── Tournament card ───────────────────────────────────────────────────────────

const TournamentCard = ({ tournament, onOpen, actionLabel = "View" }) => {
  const teamCount = tournament.teamIds?.length || 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderColor: "divider",
        borderRadius: 2,
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {tournament.name}
            </Typography>
            <StatusChip status={tournament.status} />
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              {tournament.format}
            </Typography>
            {(tournament.startDate || tournament.endDate) && (
              <>
                <Typography variant="caption" color="text.disabled">·</Typography>
                <Typography variant="caption" color="text.secondary">
                  {tournament.startDate || "?"} → {tournament.endDate || "?"}
                </Typography>
              </>
            )}
          </Stack>

          {tournament.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
                mb: 0.5,
              }}
            >
              {tournament.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={`${teamCount} team${teamCount !== 1 ? "s" : ""}`}
              sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700 }}
            />
            {!tournament.isPublic && (
              <Chip
                size="small"
                label="Private"
                sx={{ height: 18, fontSize: "0.62rem" }}
              />
            )}
          </Stack>
        </Box>

        <AppButton
          size="small"
          variant="outlined"
          onClick={() => onOpen(tournament.tournamentId)}
          startIcon={<OpenInNewIcon sx={{ fontSize: "0.9rem !important" }} />}
          sx={{ minHeight: 32, fontSize: "0.78rem", flexShrink: 0 }}
        >
          {actionLabel}
        </AppButton>
      </Stack>
    </Paper>
  );
};

const TournamentSection = ({ title, tournaments, loading, error, emptyMessage, onOpen, actionLabel }) => (
  <Box sx={{ mb: 4 }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      {!loading && (
        <Chip
          size="small"
          label={tournaments.length}
          sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
        />
      )}
    </Stack>

    {!loading && error && (
      <Paper variant="outlined" sx={{ p: 3, borderColor: "error.main", borderRadius: 2, textAlign: "center" }}>
        <Typography variant="body2" color="error.main" fontWeight={700}>Failed to load tournaments</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {error.message || "Check your connection or Firestore index configuration."}
        </Typography>
      </Paper>
    )}

    {loading && (
      <Stack spacing={1.5}>
        {[0, 1, 2].map((i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, borderColor: "divider", borderRadius: 2 }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={16} sx={{ mb: 0.75 }} />
            <Skeleton variant="rectangular" width={80} height={18} sx={{ borderRadius: 1 }} />
          </Paper>
        ))}
      </Stack>
    )}

    {!loading && !error && tournaments.length === 0 && (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )}

    {!loading && tournaments.length > 0 && (
      <Stack spacing={1.5}>
        {tournaments.map((t) => (
          <TournamentCard
            key={t.tournamentId}
            tournament={t}
            onOpen={onOpen}
            actionLabel={actionLabel}
          />
        ))}
      </Stack>
    )}
  </Box>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const TournamentsPage = () => {
  const navigate = useNavigate();
  const { user, isScorer } = useAuth();
  const { showToast } = useToast();
  const { tournaments, loading, error } = useUserTournaments();
  const {
    tournaments: publicTournaments,
    loading: publicLoading,
    error: publicError,
  } = usePublicTournaments();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = tournaments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPublic = publicTournaments
    .filter((t) => t.organizerId !== user?.uid)
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      const created = await createTournament(formData, user.uid);
      showToast("Tournament created.", "success");
      setDialogOpen(false);
      navigate(`/tournaments/${created.tournamentId}`);
    } catch {
      showToast("Failed to create tournament. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer
      title="Tournaments"
      subtitle={isScorer ? "Manage your tournaments and browse public competitions." : "Browse public cricket tournaments."}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <EmojiEventsIcon sx={{ color: "primary.main", fontSize: 24 }} />
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Tournaments
          </Typography>
        </Stack>
        {isScorer && (
          <AppButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ minHeight: 36 }}
          >
            Create Tournament
          </AppButton>
        )}
      </Stack>

      <AppInput
        placeholder="Search tournaments…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
            </InputAdornment>
          ),
        }}
        sx={{ maxWidth: 420, mb: 2.5 }}
      />

      <Divider sx={{ mb: 2.5 }} />

      {isScorer && (
        <TournamentSection
          title="My Tournaments"
          tournaments={filtered}
          loading={loading}
          error={error}
          emptyMessage="No tournaments yet. Create your first tournament to organize matches, manage teams, and track results."
          onOpen={(id) => navigate(`/tournaments/${id}`)}
          actionLabel="Manage"
        />
      )}

      <TournamentSection
        title="Public Tournaments"
        tournaments={filteredPublic}
        loading={publicLoading}
        error={publicError}
        emptyMessage={isScorer ? "No other public tournaments found." : "No public tournaments found."}
        onOpen={(id) => navigate(`/tournaments/${id}`)}
        actionLabel="View"
      />

      <TournamentFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />
    </PageContainer>
  );
};

export default TournamentsPage;
