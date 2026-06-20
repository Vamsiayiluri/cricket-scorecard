/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  IconButton,
  Link,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AddIcon from "@mui/icons-material/Add";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import PageContainer from "../components/ui/PageContainer";
import AppButton from "../components/ui/AppButton";
import AppDialog from "../components/ui/AppDialog";
import ErrorState from "../components/ui/ErrorState";
import { PageLoading } from "../components/ui/LoadingState";
import TournamentFormDialog from "../components/tournament/TournamentFormDialog";
import FixtureFormDialog from "../components/tournament/FixtureFormDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import useTournament from "../hooks/firebase/useTournament";
import useUserTeams from "../hooks/firebase/useUserTeams";
import useTournamentFixtures from "../hooks/firebase/useTournamentFixtures";
import useRealtimeCollection from "../hooks/firebase/useRealtimeCollection";
import {
  addTeamToTournament,
  archiveTournament,
  buildTournamentMatchesQuery,
  setTournamentTeams,
  TOURNAMENT_STATUS,
  updateTournament,
} from "../services/firebase/tournamentService";
import {
  createFixture,
  deleteFixture,
  deriveFixtureStatus,
  FIXTURE_STATUS,
  updateFixture,
} from "../services/firebase/fixtureService";
import { getMatchTitle, isCompletedMatch } from "../utils/matchDisplay";
import { calculateStandings, getLeader } from "../utils/tournamentStandings";
import { computeTournamentBatting, computeTournamentBowling, computeTournamentOverview } from "../utils/tournamentStats";
import { MATCH_STATUS } from "../services/firebase/constants";

// ── Tournament status chip ────────────────────────────────────────────────────

const TOURNAMENT_STATUS_COLORS = {
  [TOURNAMENT_STATUS.DRAFT]: { bg: "rgba(100,116,139,0.12)", color: "#64748B" },
  [TOURNAMENT_STATUS.UPCOMING]: { bg: "rgba(56,189,248,0.12)", color: "#38BDF8" },
  [TOURNAMENT_STATUS.LIVE]: { bg: "rgba(239,68,68,0.12)", color: "#EF4444" },
  [TOURNAMENT_STATUS.COMPLETED]: { bg: "rgba(34,197,94,0.12)", color: "#22C55E" },
};

const TStatusChip = ({ status }) => {
  const style = TOURNAMENT_STATUS_COLORS[status] || TOURNAMENT_STATUS_COLORS[TOURNAMENT_STATUS.DRAFT];
  return (
    <Chip size="small" label={status || "Draft"} sx={{ fontWeight: 800, bgcolor: style.bg, color: style.color }} />
  );
};

// ── Fixture status chip ───────────────────────────────────────────────────────

const FIXTURE_STATUS_COLORS = {
  [FIXTURE_STATUS.SCHEDULED]: { bg: "rgba(56,189,248,0.10)", color: "#38BDF8" },
  [FIXTURE_STATUS.LIVE]: { bg: "rgba(239,68,68,0.12)", color: "#EF4444" },
  [FIXTURE_STATUS.COMPLETED]: { bg: "rgba(34,197,94,0.12)", color: "#22C55E" },
};

const FStatusChip = ({ status }) => {
  const style = FIXTURE_STATUS_COLORS[status] || FIXTURE_STATUS_COLORS[FIXTURE_STATUS.SCHEDULED];
  return (
    <Chip
      size="small"
      label={status}
      sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: style.bg, color: style.color }}
    />
  );
};

// ── Info row ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }) =>
  value ? (
    <Stack direction="row" spacing={1.5} alignItems="baseline">
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  ) : null;

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent }) => (
  <Paper
    variant="outlined"
    sx={{
      flex: 1,
      p: 1.5,
      borderColor: accent ? "primary.main" : "divider",
      borderRadius: 2,
      bgcolor: accent ? "rgba(108,99,255,0.04)" : "transparent",
      minWidth: 0,
    }}
  >
    <Typography
      variant="h3"
      sx={{
        fontWeight: 900,
        fontSize: { xs: "1.4rem", sm: "1.6rem" },
        color: accent ? "primary.main" : "text.primary",
        lineHeight: 1,
        mb: 0.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block" }}>
      {label}
    </Typography>
    {sub && (
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.62rem" }}>
        {sub}
      </Typography>
    )}
  </Paper>
);

// ── Standings table ───────────────────────────────────────────────────────────

const COL_H = { fontSize: "0.7rem", fontWeight: 800, color: "text.secondary", textAlign: "center", width: 36 };
const COL_C = { fontSize: "0.82rem", fontWeight: 700, textAlign: "center", width: 36 };

const StandingsTable = ({ standings, loading }) => {
  if (loading) return <Stack spacing={1}>{[0,1,2].map(i => <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1.5 }} />)}</Stack>;

  const played = standings.filter(r => r.played > 0);

  if (standings.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
        <GroupsIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.75 }} />
        <Typography variant="body2" color="text.secondary">No teams added yet.</Typography>
      </Paper>
    );
  }

  return (
    <>
      {played.length === 0 && (
        <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderColor: "divider", borderRadius: 1.5, mb: 2 }}>
          <LeaderboardIcon sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            No completed matches yet — standings will update when matches finish.
          </Typography>
        </Paper>
      )}
      <Paper variant="outlined" sx={{ borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
        <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1, bgcolor: theme => theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)", borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography sx={{ ...COL_H, width: 28, textAlign: "left" }}>#</Typography>
          <Typography sx={{ flex: 1, fontSize: "0.7rem", fontWeight: 800, color: "text.secondary" }}>TEAM</Typography>
          {["P","W","L","T","PTS"].map(h => <Typography key={h} sx={COL_H}>{h}</Typography>)}
        </Stack>
        {standings.map((row, idx) => {
          const isLeader = idx === 0 && row.played > 0;
          return (
            <Stack key={row.teamName} direction="row" alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: idx < standings.length - 1 ? "1px solid" : "none", borderColor: "divider", bgcolor: isLeader ? (theme => theme.palette.mode === "dark" ? "rgba(108,99,255,0.06)" : "rgba(108,99,255,0.04)") : "transparent" }}>
              <Typography sx={{ width: 28, fontSize: "0.78rem", fontWeight: isLeader ? 900 : 600, color: isLeader ? "primary.main" : "text.secondary" }}>{idx + 1}</Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                {isLeader && <EmojiEventsOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />}
                <Typography variant="body2" sx={{ fontWeight: isLeader ? 800 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isLeader ? "primary.main" : "text.primary" }}>{row.teamName}</Typography>
              </Stack>
              {[row.played, row.won, row.lost, row.tied].map((v, i) => <Typography key={i} sx={{ ...COL_C, color: "text.secondary" }}>{v}</Typography>)}
              <Typography sx={{ ...COL_C, color: isLeader ? "primary.main" : "text.primary", fontWeight: isLeader ? 900 : 800, fontSize: "0.88rem" }}>{row.points}</Typography>
            </Stack>
          );
        })}
      </Paper>
    </>
  );
};

// ── Fixture row ───────────────────────────────────────────────────────────────

const FixtureRow = ({ fixture, derivedStatus, matchId, isOwner, onEdit, onDelete, onCreateMatch, onViewMatch }) => {
  const hasMatch = Boolean(matchId);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderColor: derivedStatus === FIXTURE_STATUS.LIVE ? "error.main" : "divider",
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {fixture.teamAName} <span style={{ fontWeight: 400, opacity: 0.5 }}>vs</span> {fixture.teamBName}
          </Typography>
          <FStatusChip status={derivedStatus} />
        </Stack>
        {fixture.scheduledDate && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarMonthIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
              {fixture.scheduledDate}
            </Typography>
          </Stack>
        )}
      </Box>

      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
        {hasMatch ? (
          <AppButton
            size="small"
            variant="outlined"
            onClick={() => onViewMatch(matchId, derivedStatus)}
            sx={{ minHeight: 28, fontSize: "0.72rem" }}
          >
            {derivedStatus === FIXTURE_STATUS.LIVE ? "Watch" : "View"}
          </AppButton>
        ) : isOwner ? (
          <Tooltip title="Create a match for this fixture">
            <AppButton
              size="small"
              variant="contained"
              startIcon={<PlayCircleOutlineIcon sx={{ fontSize: "0.9rem !important" }} />}
              onClick={onCreateMatch}
              sx={{ minHeight: 28, fontSize: "0.72rem" }}
            >
              Create Match
            </AppButton>
          </Tooltip>
        ) : null}

        {isOwner && !hasMatch && (
          <>
            <Tooltip title="Edit fixture">
              <IconButton size="small" onClick={onEdit} sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                <EditOutlinedIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete fixture">
              <IconButton size="small" onClick={onDelete} sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "error.main" } }}>
                <DeleteOutlineIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>
    </Paper>
  );
};

// ── Fixture section header ────────────────────────────────────────────────────

const FixtureSectionHeader = ({ label, count }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, mt: 2 }}>
    <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem" }}>
      {label}
    </Typography>
    <Chip size="small" label={count} sx={{ height: 16, fontSize: "0.58rem", fontWeight: 700 }} />
    <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
  </Stack>
);

// ── Add Team Dialog ───────────────────────────────────────────────────────────

const AddTeamDialog = ({ open, onClose, allTeams, assignedIds, onAdd }) => {
  const available = useMemo(() => allTeams.filter(t => !assignedIds.includes(t.teamId)), [allTeams, assignedIds]);
  if (!open) return null;
  return (
    <AppDialog open={open} onClose={onClose} title="Add Team to Tournament" maxWidth="xs">
      {available.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          All your teams are already in this tournament, or you have no teams yet. Create teams on the{" "}
          <Link href="/teams" underline="hover">My Teams</Link> page.
        </Typography>
      ) : (
        <Stack spacing={1} sx={{ pt: 0.5 }}>
          {available.map(team => (
            <Paper key={team.teamId} variant="outlined" sx={{ p: 1.5, borderColor: "divider", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{team.name}</Typography>
                <Typography variant="caption" color="text.secondary">{team.players?.length || 0} players</Typography>
              </Box>
              <AppButton size="small" variant="outlined" onClick={() => onAdd(team.teamId)} sx={{ minHeight: 30, fontSize: "0.75rem" }}>Add</AppButton>
            </Paper>
          ))}
        </Stack>
      )}
    </AppDialog>
  );
};

// ── Match row ─────────────────────────────────────────────────────────────────

const MatchRow = ({ match }) => {
  const navigate = useNavigate();
  const completed = isCompletedMatch(match);
  const isLive = match.status === MATCH_STATUS.IN_PROGRESS;
  const matchId = match.matchId || match.id;
  const statusColor = completed ? "#22C55E" : isLive ? "#EF4444" : "#64748B";
  const statusLabel = completed ? "Completed" : isLive ? "Live" : "Scheduled";
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderColor: "divider", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, "&:hover": { borderColor: "primary.main" } }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getMatchTitle(match)}</Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" label={statusLabel} sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800, bgcolor: `${statusColor}1A`, color: statusColor }} />
          {match.matchDetails?.date && <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.68rem" }}>{match.matchDetails.date?.slice(0, 10)}</Typography>}
        </Stack>
      </Box>
      <AppButton size="small" variant="outlined" onClick={() => navigate(isLive ? `/live/${matchId}` : `/scorecard/${matchId}`)} sx={{ minHeight: 28, fontSize: "0.72rem", flexShrink: 0 }}>
        {isLive ? "Watch" : "View"}
      </AppButton>
    </Paper>
  );
};

// ── Tab panel ─────────────────────────────────────────────────────────────────

const TabPanel = ({ value, index, children }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

// ── Stats overview card ───────────────────────────────────────────────────────

const OverviewCard = ({ label, value, sub }) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderColor: "divider", borderRadius: 1.5, flex: 1, minWidth: { xs: "calc(50% - 6px)", sm: 140 } }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: "block", mb: 0.25 }}>{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 900, fontSize: "0.95rem", lineHeight: 1.2 }}>{value}</Typography>
    {sub && <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>{sub}</Typography>}
  </Paper>
);

// ── Batter leaderboard ────────────────────────────────────────────────────────

const BH = { fontSize: "0.68rem", fontWeight: 800, color: "text.secondary", textAlign: "center", minWidth: 36 };
const BC = { fontSize: "0.8rem", fontWeight: 700, textAlign: "center", minWidth: 36 };

const BatterLeaderboard = ({ batters }) => {
  if (batters.length === 0) return (
    <Paper variant="outlined" sx={{ p: 2.5, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
      <Typography variant="body2" color="text.secondary">No batting data yet.</Typography>
    </Paper>
  );
  return (
    <Paper variant="outlined" sx={{ borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" sx={{ px: 1.5, py: 0.75, bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography sx={{ ...BH, minWidth: 24, textAlign: "left" }}>#</Typography>
        <Typography sx={{ flex: 1, fontSize: "0.68rem", fontWeight: 800, color: "text.secondary" }}>PLAYER</Typography>
        {["INN", "RUNS", "HS", "AVG", "SR"].map((h) => <Typography key={h} sx={BH}>{h}</Typography>)}
      </Stack>
      {batters.map((b, idx) => (
        <Stack key={`${b.name}-${b.teamName}`} direction="row" alignItems="center" sx={{ px: 1.5, py: 1, borderBottom: idx < batters.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
          <Typography sx={{ minWidth: 24, fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>{idx + 1}</Typography>
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <Typography variant="body2" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{b.teamName}</Typography>
          </Box>
          <Typography sx={{ ...BC, color: "text.secondary" }}>{b.innings}</Typography>
          <Typography sx={{ ...BC, color: "primary.main", fontWeight: 900 }}>{b.runs}</Typography>
          <Typography sx={BC}>{b.highestScore}</Typography>
          <Typography sx={{ ...BC, color: "text.secondary" }}>{b.average}</Typography>
          <Typography sx={{ ...BC, color: "text.secondary" }}>{b.strikeRate}</Typography>
        </Stack>
      ))}
    </Paper>
  );
};

// ── Bowler leaderboard ────────────────────────────────────────────────────────

const BowlerLeaderboard = ({ bowlers }) => {
  if (bowlers.length === 0) return (
    <Paper variant="outlined" sx={{ p: 2.5, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
      <Typography variant="body2" color="text.secondary">No bowling data yet.</Typography>
    </Paper>
  );
  return (
    <Paper variant="outlined" sx={{ borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" sx={{ px: 1.5, py: 0.75, bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)", borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography sx={{ ...BH, minWidth: 24, textAlign: "left" }}>#</Typography>
        <Typography sx={{ flex: 1, fontSize: "0.68rem", fontWeight: 800, color: "text.secondary" }}>PLAYER</Typography>
        {["OVR", "WKTS", "RUNS", "ECO"].map((h) => <Typography key={h} sx={BH}>{h}</Typography>)}
      </Stack>
      {bowlers.map((b, idx) => (
        <Stack key={`${b.name}-${b.teamName}`} direction="row" alignItems="center" sx={{ px: 1.5, py: 1, borderBottom: idx < bowlers.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
          <Typography sx={{ minWidth: 24, fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>{idx + 1}</Typography>
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <Typography variant="body2" sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{b.teamName}</Typography>
          </Box>
          <Typography sx={{ ...BC, color: "text.secondary" }}>{b.overs}</Typography>
          <Typography sx={{ ...BC, color: "primary.main", fontWeight: 900 }}>{b.wickets}</Typography>
          <Typography sx={{ ...BC, color: "text.secondary" }}>{b.runs}</Typography>
          <Typography sx={{ ...BC, color: "text.secondary" }}>{b.economy}</Typography>
        </Stack>
      ))}
    </Paper>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const TournamentDetailsPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { data: tournament, loading, error } = useTournament(tournamentId);
  const { teams: allTeams } = useUserTeams();
  const { fixtures, loading: fixturesLoading } = useTournamentFixtures(tournamentId);

  const [activeTab, setActiveTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [fixtureDialogOpen, setFixtureDialogOpen] = useState(false);
  const [fixtureToEdit, setFixtureToEdit] = useState(null);
  const [fixtureToDelete, setFixtureToDelete] = useState(null);
  const [savingFixture, setSavingFixture] = useState(false);
  const [saving, setSaving] = useState(false);

  // Realtime tournament matches — standings, fixtures, statistics update automatically.
  const tournamentMatchesQuery = useMemo(() => buildTournamentMatchesQuery(tournamentId), [tournamentId]);
  const { data: tournamentMatches, loading: matchesLoading } = useRealtimeCollection(tournamentMatchesQuery, { enabled: Boolean(tournamentId) });

  const teamMap = useMemo(() => new Map(allTeams.map(t => [t.teamId, t])), [allTeams]);

  // teamIds stores { teamId, name } objects (new) or plain strings (legacy).
  // Resolve to full team objects where available; fall back to name-only stubs for legacy entries.
  const assignedTeams = useMemo(
    () => (tournament?.teamIds || []).map(entry => {
      if (typeof entry === "string") {
        return teamMap.get(entry) || { teamId: entry, name: entry, players: [] };
      }
      const full = teamMap.get(entry.teamId);
      return full || { teamId: entry.teamId, name: entry.name, players: [] };
    }),
    [tournament?.teamIds, teamMap]
  );

  const completedMatches = useMemo(() => tournamentMatches.filter(isCompletedMatch), [tournamentMatches]);

  const allTeamNames = useMemo(() => assignedTeams.map(t => t.name).filter(Boolean), [assignedTeams]);

  const standings = useMemo(() => calculateStandings(completedMatches, allTeamNames), [completedMatches, allTeamNames]);

  const leader = useMemo(() => getLeader(standings), [standings]);

  const tournamentBatters = useMemo(() => computeTournamentBatting(completedMatches), [completedMatches]);
  const tournamentBowlers = useMemo(() => computeTournamentBowling(completedMatches), [completedMatches]);
  const tournamentOverview = useMemo(() => computeTournamentOverview(completedMatches), [completedMatches]);

  // Map matchId → match for fixture status derivation
  const matchesById = useMemo(
    () => new Map(tournamentMatches.map(m => [m.matchId || m.id, m])),
    [tournamentMatches]
  );

  // Derive status for each fixture and group
  const fixturesWithStatus = useMemo(
    () => fixtures.map(f => ({ ...f, derivedStatus: deriveFixtureStatus(f, matchesById) })),
    [fixtures, matchesById]
  );

  const liveFixtures = useMemo(() => fixturesWithStatus.filter(f => f.derivedStatus === FIXTURE_STATUS.LIVE), [fixturesWithStatus]);
  const upcomingFixtures = useMemo(() => fixturesWithStatus.filter(f => f.derivedStatus === FIXTURE_STATUS.SCHEDULED), [fixturesWithStatus]);
  const completedFixtures = useMemo(() => fixturesWithStatus.filter(f => f.derivedStatus === FIXTURE_STATUS.COMPLETED), [fixturesWithStatus]);

  const today = new Date().toISOString().slice(0, 10);
  const nextFixture = useMemo(() =>
    upcomingFixtures
      .filter(f => !f.scheduledDate || f.scheduledDate >= today)
      .sort((a, b) => (a.scheduledDate || "").localeCompare(b.scheduledDate || ""))[0] || null,
    [upcomingFixtures, today]
  );

  if (loading) return <PageLoading text="Loading tournament…" />;
  if (error || !tournament) return <ErrorState message="Tournament not found." />;

  const isOwner = tournament.organizerId === user?.uid;

  const handleEdit = async (formData) => {
    setSaving(true);
    try {
      await updateTournament(tournamentId, formData);
      showToast("Tournament updated.", "success");
      setEditOpen(false);
    } catch {
      showToast("Failed to update. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeam = async (teamId) => {
    const team = teamMap.get(teamId);
    if (!team) return;
    try {
      await addTeamToTournament(tournamentId, { teamId, name: team.name });
      showToast("Team added.", "success");
      setAddTeamOpen(false);
    } catch {
      showToast("Failed to add team.", "error");
    }
  };

  const handleRemoveTeam = async (teamId) => {
    const newTeamIds = (tournament.teamIds || []).filter(entry =>
      (typeof entry === "string" ? entry : entry.teamId) !== teamId
    );
    try {
      await setTournamentTeams(tournamentId, newTeamIds);
      showToast("Team removed.", "info");
    } catch {
      showToast("Failed to remove team.", "error");
    }
  };

  const handleArchive = async () => {
    try {
      await archiveTournament(tournamentId);
      showToast("Tournament archived.", "info");
      setArchiveOpen(false);
      navigate("/tournaments");
    } catch {
      showToast("Failed to archive.", "error");
    }
  };

  const handleSaveFixture = async (formData) => {
    setSavingFixture(true);
    try {
      if (fixtureToEdit) {
        await updateFixture(tournamentId, fixtureToEdit.fixtureId, formData);
        showToast("Fixture updated.", "success");
      } else {
        await createFixture(tournamentId, formData);
        showToast("Fixture added.", "success");
      }
      setFixtureDialogOpen(false);
      setFixtureToEdit(null);
    } catch {
      showToast("Failed to save fixture.", "error");
    } finally {
      setSavingFixture(false);
    }
  };

  const handleDeleteFixture = async () => {
    if (!fixtureToDelete) return;
    try {
      await deleteFixture(tournamentId, fixtureToDelete.fixtureId);
      showToast("Fixture deleted.", "info");
      setFixtureToDelete(null);
    } catch {
      showToast("Failed to delete fixture.", "error");
    }
  };

  const handleCreateMatchFromFixture = (fixture) => {
    navigate("/create-match", {
      state: {
        fixturePreFill: {
          teamAName: fixture.teamAName,
          teamBName: fixture.teamBName,
          title: `${fixture.teamAName} vs ${fixture.teamBName}`,
          tournamentId,
          fixtureId: fixture.fixtureId,
        },
      },
    });
  };

  const handleViewMatch = (matchId, derivedStatus) => {
    if (derivedStatus === FIXTURE_STATUS.LIVE) navigate(`/live/${matchId}`);
    else navigate(`/scorecard/${matchId}`);
  };

  const openNewFixture = () => {
    setFixtureToEdit(null);
    setFixtureDialogOpen(true);
  };

  const openEditFixture = (fixture) => {
    setFixtureToEdit(fixture);
    setFixtureDialogOpen(true);
  };

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ mb: 2 }}>
        <Link underline="hover" sx={{ fontSize: "0.82rem", cursor: "pointer", color: "text.secondary" }} onClick={() => navigate("/tournaments")}>
          Tournaments
        </Link>
        <Typography variant="caption" sx={{ fontSize: "0.82rem", fontWeight: 700, color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
          {tournament.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <EmojiEventsIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h2" sx={{ fontWeight: 850, letterSpacing: "-0.02em" }}>{tournament.name}</Typography>
              <TStatusChip status={tournament.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary">{tournament.format}{!tournament.isPublic && " · Private"}</Typography>
          </Box>
        </Stack>
        {isOwner && (
          <Stack direction="row" spacing={1}>
            <AppButton size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setEditOpen(true)} sx={{ minHeight: 34 }}>Edit</AppButton>
            <Tooltip title="Archive tournament">
              <IconButton size="small" onClick={() => setArchiveOpen(true)} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 0.75 }}>
                <DeleteOutlineIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      {/* Dashboard stats strip */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
        <StatCard label="Teams" value={assignedTeams.length} />
        <StatCard
          label="Upcoming"
          value={fixturesLoading ? "—" : upcomingFixtures.length}
          sub={nextFixture ? `Next: ${nextFixture.scheduledDate || "TBD"}` : upcomingFixtures.length === 0 ? "No upcoming" : undefined}
        />
        <StatCard label="Completed" value={matchesLoading ? "—" : completedMatches.length} />
        <StatCard
          label="Leader"
          value={leader ? leader.teamName : "—"}
          sub={leader ? `${leader.points} pts · ${leader.won}W` : "No results yet"}
          accent={Boolean(leader)}
        />
      </Stack>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderColor: "divider", borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1.5, borderBottom: "1px solid", borderColor: "divider", "& .MuiTab-root": { fontSize: "0.82rem", fontWeight: 700, minHeight: 44 } }}
        >
          <Tab label="Overview" />
          <Tab label={
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <span>Standings</span>
              {standings.length > 0 && <Chip size="small" label={standings.length} sx={{ height: 16, fontSize: "0.58rem", fontWeight: 800 }} />}
            </Stack>
          } />
          <Tab label={
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <span>Fixtures</span>
              {!fixturesLoading && fixtures.length > 0 && (
                <Chip size="small" label={fixtures.length} sx={{ height: 16, fontSize: "0.58rem", fontWeight: 800 }} />
              )}
            </Stack>
          } />
          <Tab label={
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <span>Teams</span>
              {assignedTeams.length > 0 && <Chip size="small" label={assignedTeams.length} sx={{ height: 16, fontSize: "0.58rem", fontWeight: 800 }} />}
            </Stack>
          } />
          <Tab label={
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <span>Matches</span>
              {!matchesLoading && tournamentMatches.length > 0 && <Chip size="small" label={tournamentMatches.length} sx={{ height: 16, fontSize: "0.58rem", fontWeight: 800 }} />}
            </Stack>
          } />
          <Tab label="Statistics" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {/* ── 0: Overview ──────────────────────────── */}
          <TabPanel value={activeTab} index={0}>
            <Stack spacing={0.75}>
              <InfoRow label="Format" value={tournament.format} />
              <InfoRow label="Status" value={tournament.status} />
              <InfoRow label="Start" value={tournament.startDate} />
              <InfoRow label="End" value={tournament.endDate} />
              <InfoRow label="Visibility" value={tournament.isPublic ? "Public" : "Private"} />
            </Stack>
            {tournament.description && (
              <>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{tournament.description}</Typography>
              </>
            )}
          </TabPanel>

          {/* ── 2: Fixtures ──────────────────────────── */}
          <TabPanel value={activeTab} index={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarMonthIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Fixtures</Typography>
              </Stack>
              {isOwner && (
                <AppButton size="small" variant="outlined" startIcon={<AddIcon />} onClick={openNewFixture} sx={{ minHeight: 30, fontSize: "0.75rem" }}>
                  Add Fixture
                </AppButton>
              )}
            </Stack>

            {fixturesLoading ? (
              <Stack spacing={1}>{[0,1,2].map(i => <Skeleton key={i} variant="rectangular" height={62} sx={{ borderRadius: 1.5 }} />)}</Stack>
            ) : fixtures.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.75 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>No fixtures yet.</Typography>
                {isOwner && assignedTeams.length >= 2 ? (
                  <AppButton size="small" variant="outlined" startIcon={<AddIcon />} onClick={openNewFixture} sx={{ mt: 1 }}>Add First Fixture</AppButton>
                ) : isOwner ? (
                  <Typography variant="caption" color="text.disabled">Add at least 2 teams before creating fixtures.</Typography>
                ) : null}
              </Paper>
            ) : (
              <>
                {liveFixtures.length > 0 && (
                  <>
                    <FixtureSectionHeader label="Live" count={liveFixtures.length} />
                    <Stack spacing={1}>
                      {liveFixtures.map(f => (
                        <FixtureRow key={f.fixtureId} fixture={f} derivedStatus={f.derivedStatus} matchId={f.matchId} isOwner={isOwner}
                          onEdit={() => openEditFixture(f)} onDelete={() => setFixtureToDelete(f)}
                          onCreateMatch={() => handleCreateMatchFromFixture(f)}
                          onViewMatch={handleViewMatch} />
                      ))}
                    </Stack>
                  </>
                )}

                {upcomingFixtures.length > 0 && (
                  <>
                    <FixtureSectionHeader label="Upcoming" count={upcomingFixtures.length} />
                    <Stack spacing={1}>
                      {upcomingFixtures.map(f => (
                        <FixtureRow key={f.fixtureId} fixture={f} derivedStatus={f.derivedStatus} matchId={f.matchId} isOwner={isOwner}
                          onEdit={() => openEditFixture(f)} onDelete={() => setFixtureToDelete(f)}
                          onCreateMatch={() => handleCreateMatchFromFixture(f)}
                          onViewMatch={handleViewMatch} />
                      ))}
                    </Stack>
                  </>
                )}

                {completedFixtures.length > 0 && (
                  <>
                    <FixtureSectionHeader label="Completed" count={completedFixtures.length} />
                    <Stack spacing={1}>
                      {completedFixtures.map(f => (
                        <FixtureRow key={f.fixtureId} fixture={f} derivedStatus={f.derivedStatus} matchId={f.matchId} isOwner={isOwner}
                          onEdit={() => openEditFixture(f)} onDelete={() => setFixtureToDelete(f)}
                          onCreateMatch={() => handleCreateMatchFromFixture(f)}
                          onViewMatch={handleViewMatch} />
                      ))}
                    </Stack>
                  </>
                )}

                {liveFixtures.length === 0 && upcomingFixtures.length === 0 && completedFixtures.length > 0 && null}
              </>
            )}
          </TabPanel>

          {/* ── 1: Standings ─────────────────────────── */}
          <TabPanel value={activeTab} index={1}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <LeaderboardIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Points Table</Typography>
              <Typography variant="caption" color="text.secondary">Win = 2 pts · Tie = 1 pt · Loss = 0 pts</Typography>
            </Stack>
            <StandingsTable standings={standings} loading={matchesLoading} />
          </TabPanel>

          {/* ── 3: Teams ─────────────────────────────── */}
          <TabPanel value={activeTab} index={3}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <GroupsIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Teams</Typography>
              </Stack>
              {isOwner && (
                <AppButton size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddTeamOpen(true)} sx={{ minHeight: 30, fontSize: "0.75rem" }}>Add Team</AppButton>
              )}
            </Stack>
            {assignedTeams.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 2.5, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
                <GroupsIcon sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">No teams added yet.{isOwner && ' Click “Add Team” to assign existing teams.'}</Typography>
              </Paper>
            ) : (
              <Stack spacing={1}>
                {assignedTeams.map(team => (
                  <Paper key={team.teamId} variant="outlined" sx={{ p: 1.25, borderColor: "divider", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{team.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{team.players?.length || 0} players{team.captain ? ` · C: ${team.captain}` : ""}</Typography>
                    </Box>
                    {isOwner && (
                      <Tooltip title="Remove from tournament">
                        <IconButton size="small" onClick={() => handleRemoveTeam(team.teamId)} sx={{ p: 0.5, color: "text.disabled", "&:hover": { color: "error.main" } }}>
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </TabPanel>

          {/* ── 4: Matches ───────────────────────────── */}
          <TabPanel value={activeTab} index={4}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SportsCricketIcon sx={{ fontSize: 18, color: "primary.main" }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>Matches</Typography>
              </Stack>
              {isOwner && (
                <Tooltip title="Create a match and select this tournament in the Notes step">
                  <AppButton size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/create-match")} sx={{ minHeight: 30, fontSize: "0.75rem" }}>Add Match</AppButton>
                </Tooltip>
              )}
            </Stack>
            {matchesLoading ? (
              <Stack spacing={1}>{[0,1].map(i => <Skeleton key={i} variant="rectangular" height={58} sx={{ borderRadius: 1.5 }} />)}</Stack>
            ) : tournamentMatches.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 2.5, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
                <SportsCricketIcon sx={{ fontSize: 28, color: "text.disabled", mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">No matches linked yet. Create fixtures and use &quot;Create Match&quot; to link them.</Typography>
              </Paper>
            ) : (
              <Stack spacing={1}>
                {tournamentMatches.map(m => <MatchRow key={m.matchId || m.id} match={m} />)}
              </Stack>
            )}
          </TabPanel>

          {/* ── 5: Statistics ────────────────────────── */}
          <TabPanel value={activeTab} index={5}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BarChartIcon sx={{ fontSize: 18, color: "primary.main" }} />
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Tournament Statistics</Typography>
            </Stack>

            {completedMatches.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "divider", borderRadius: 1.5 }}>
                <BarChartIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.75 }} />
                <Typography variant="body2" color="text.secondary">No completed matches yet — statistics will appear when matches finish.</Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {/* Overview */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem", mb: 1, display: "block" }}>Overview</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    <OverviewCard label="Matches Played" value={tournamentOverview.totalMatches} />
                    <OverviewCard label="Total Runs" value={tournamentOverview.totalRuns} />
                    <OverviewCard label="Total Wickets" value={tournamentOverview.totalWickets} />
                    {tournamentOverview.highestTeamScore && (
                      <OverviewCard
                        label="Highest Team Score"
                        value={`${tournamentOverview.highestTeamScore.runs}/${tournamentOverview.highestTeamScore.wickets}`}
                        sub={`${tournamentOverview.highestTeamScore.teamName} vs ${tournamentOverview.highestTeamScore.vs}`}
                      />
                    )}
                    {tournamentOverview.highestIndividualScore && (
                      <OverviewCard
                        label="Highest Individual"
                        value={`${tournamentOverview.highestIndividualScore.runs}${tournamentOverview.highestIndividualScore.isOut ? "" : "*"}`}
                        sub={`${tournamentOverview.highestIndividualScore.name} (${tournamentOverview.highestIndividualScore.teamName})`}
                      />
                    )}
                    {tournamentOverview.bestBowling && (
                      <OverviewCard
                        label="Best Bowling"
                        value={`${tournamentOverview.bestBowling.wickets}/${tournamentOverview.bestBowling.runs}`}
                        sub={`${tournamentOverview.bestBowling.name} (${tournamentOverview.bestBowling.teamName})`}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Top Batters */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem", mb: 1, display: "block" }}>Top Batters</Typography>
                  <BatterLeaderboard batters={tournamentBatters} />
                </Box>

                {/* Top Bowlers */}
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem", mb: 1, display: "block" }}>Top Bowlers</Typography>
                  <BowlerLeaderboard bowlers={tournamentBowlers} />
                </Box>
              </Stack>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* Dialogs */}
      {isOwner && (
        <>
          <TournamentFormDialog open={editOpen} onClose={() => setEditOpen(false)} onSave={handleEdit} tournament={tournament} saving={saving} />

          <FixtureFormDialog
            open={fixtureDialogOpen}
            onClose={() => { setFixtureDialogOpen(false); setFixtureToEdit(null); }}
            onSave={handleSaveFixture}
            fixture={fixtureToEdit}
            assignedTeams={assignedTeams}
            saving={savingFixture}
          />

          <AddTeamDialog open={addTeamOpen} onClose={() => setAddTeamOpen(false)} allTeams={allTeams} assignedIds={assignedTeams.map(t => t.teamId)} onAdd={handleAddTeam} />

          <AppDialog open={Boolean(fixtureToDelete)} onClose={() => setFixtureToDelete(null)} title="Delete Fixture" maxWidth="xs"
            actions={[
              { label: "Cancel", onClick: () => setFixtureToDelete(null), variant: "outlined" },
              { label: "Delete", onClick: handleDeleteFixture, variant: "contained", color: "error" },
            ]}
          >
            <Typography variant="body2">
              Delete fixture <strong>{fixtureToDelete?.teamAName} vs {fixtureToDelete?.teamBName}</strong>? This cannot be undone.
            </Typography>
          </AppDialog>

          <AppDialog open={archiveOpen} onClose={() => setArchiveOpen(false)} title="Archive Tournament" maxWidth="xs"
            actions={[
              { label: "Cancel", onClick: () => setArchiveOpen(false), variant: "outlined" },
              { label: "Archive", onClick: handleArchive, variant: "contained", color: "error" },
            ]}
          >
            <Typography variant="body2">Archive <strong>{tournament.name}</strong>? It will be hidden from your list but all data is preserved.</Typography>
          </AppDialog>
        </>
      )}
    </PageContainer>
  );
};

export default TournamentDetailsPage;
