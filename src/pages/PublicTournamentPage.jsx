/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import GroupsIcon from "@mui/icons-material/Groups";
import BarChartIcon from "@mui/icons-material/BarChart";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import PageContainer from "../components/ui/PageContainer";
import useTournament from "../hooks/firebase/useTournament";
import useTournamentFixtures from "../hooks/firebase/useTournamentFixtures";
import useRealtimeCollection from "../hooks/firebase/useRealtimeCollection";
import { buildTournamentMatchesQuery, TOURNAMENT_STATUS } from "../services/firebase/tournamentService";
import { trackTournamentViewed } from "../services/analytics/analyticsService";
import { calculateStandings } from "../utils/tournamentStandings";
import { computeTournamentBatting, computeTournamentBowling, computeTournamentOverview } from "../utils/tournamentStats";
import { isCompletedMatch } from "../utils/matchDisplay";
import { deriveFixtureStatus, FIXTURE_STATUS } from "../services/firebase/fixtureService";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  [TOURNAMENT_STATUS.DRAFT]: "#64748B",
  [TOURNAMENT_STATUS.UPCOMING]: "#38BDF8",
  [TOURNAMENT_STATUS.LIVE]: "#EF4444",
  [TOURNAMENT_STATUS.COMPLETED]: "#22C55E",
};

const TStatusChip = ({ status }) => (
  <Chip
    size="small"
    label={status || "Draft"}
    sx={{ fontWeight: 800, bgcolor: `${STATUS_COLORS[status] || "#64748B"}22`, color: STATUS_COLORS[status] || "#64748B" }}
  />
);

const FStatusChip = ({ status }) => {
  const COLOR = { [FIXTURE_STATUS.LIVE]: "#EF4444", [FIXTURE_STATUS.COMPLETED]: "#22C55E", [FIXTURE_STATUS.SCHEDULED]: "#38BDF8" };
  return (
    <Chip size="small" label={status} sx={{ height: 18, fontSize: "0.62rem", fontWeight: 800, bgcolor: `${COLOR[status] || "#38BDF8"}22`, color: COLOR[status] || "#38BDF8" }} />
  );
};

const TabPanel = ({ children, value, index }) =>
  value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;

const COL_H = { fontSize: "0.7rem", fontWeight: 800, color: "text.secondary", textAlign: "center", width: 36 };
const COL_C = { fontSize: "0.82rem", fontWeight: 700, textAlign: "center", width: 36 };

// ── Standings table ───────────────────────────────────────────────────────────

const StandingsTable = ({ standings, loading }) => {
  if (loading) return <Stack spacing={1}>{[0,1,2].map(i => <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 1 }} />)}</Stack>;
  if (!standings.length) return <Typography color="text.secondary" variant="body2">No standings yet.</Typography>;

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 1.5 }}>
      <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1, bgcolor: "action.hover" }}>
        <Typography sx={{ width: 28, ...COL_H, textAlign: "left" }}>#</Typography>
        <Typography sx={{ flex: 1, ...COL_H, textAlign: "left" }}>TEAM</Typography>
        {["P","W","L","T","PTS"].map(h => <Typography key={h} sx={COL_H}>{h}</Typography>)}
      </Stack>
      {standings.map((row, idx) => {
        const isLeader = idx === 0 && row.played > 0;
        return (
          <Stack key={row.teamName} direction="row" alignItems="center" sx={{ px: 2, py: 1.25, borderTop: "1px solid", borderColor: "divider", bgcolor: isLeader ? "rgba(108,99,255,0.04)" : "transparent" }}>
            <Typography sx={{ width: 28, fontSize: "0.78rem", fontWeight: isLeader ? 900 : 600, color: isLeader ? "primary.main" : "text.secondary" }}>{idx + 1}</Typography>
            <Typography sx={{ flex: 1, fontSize: "0.85rem", fontWeight: isLeader ? 800 : 600, color: isLeader ? "primary.main" : "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.teamName}</Typography>
            {[row.played, row.won, row.lost, row.tied].map((v, i) => <Typography key={i} sx={{ ...COL_C, color: "text.secondary" }}>{v}</Typography>)}
            <Typography sx={{ ...COL_C, fontWeight: isLeader ? 900 : 800, color: isLeader ? "primary.main" : "text.primary" }}>{row.points}</Typography>
          </Stack>
        );
      })}
    </Paper>
  );
};

// ── Leaderboard table ─────────────────────────────────────────────────────────

const LeaderTable = ({ rows, cols, highlightIdx }) => (
  <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 1.5 }}>
    <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1, bgcolor: "action.hover" }}>
      <Typography sx={{ width: 24, ...COL_H }}>#</Typography>
      <Typography sx={{ flex: 1, ...COL_H, textAlign: "left" }}>PLAYER / TEAM</Typography>
      {cols.map(c => <Typography key={c.key} sx={{ ...COL_H, width: 48 }}>{c.label}</Typography>)}
    </Stack>
    {rows.map((row, idx) => (
      <Stack key={idx} direction="row" alignItems="center" sx={{ px: 2, py: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography sx={{ width: 24, fontSize: "0.75rem", color: "text.secondary" }}>{idx + 1}</Typography>
        <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
          <Typography variant="body2" fontWeight={700} noWrap>{row.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>{row.teamName}</Typography>
        </Box>
        {cols.map((c, ci) => (
          <Typography key={c.key} sx={{ ...COL_C, width: 48, color: ci === highlightIdx ? "primary.main" : "text.primary", fontWeight: ci === highlightIdx ? 900 : 700 }}>
            {row[c.key]}
          </Typography>
        ))}
      </Stack>
    ))}
  </Paper>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const PublicTournamentPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { data: tournament, loading, error } = useTournament(tournamentId);
  const { fixtures, loading: fixturesLoading } = useTournamentFixtures(tournamentId);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (tournamentId) trackTournamentViewed({ tournament_id: tournamentId });
  }, [tournamentId]);

  // Realtime tournament matches — standings and statistics update as games finish.
  const tournamentMatchesQuery = useMemo(() => buildTournamentMatchesQuery(tournamentId), [tournamentId]);
  const { data: matches, loading: matchesLoading } = useRealtimeCollection(tournamentMatchesQuery, { enabled: Boolean(tournamentId) });

  const completedMatches = useMemo(() => matches.filter(isCompletedMatch), [matches]);
  const matchesById = useMemo(() => new Map(matches.map(m => [m.matchId || m.id, m])), [matches]);
  // teamIds stores { teamId, name } objects (new) or plain strings (legacy).
  const allTeamNames = useMemo(() => (tournament?.teamIds || []).map(t => t.name || t), [tournament]);
  const standings = useMemo(() => calculateStandings(completedMatches, allTeamNames), [completedMatches, allTeamNames]);
  const batters = useMemo(() => computeTournamentBatting(completedMatches), [completedMatches]);
  const bowlers = useMemo(() => computeTournamentBowling(completedMatches), [completedMatches]);
  const overview = useMemo(() => computeTournamentOverview(completedMatches), [completedMatches]);

  if (loading) {
    return (
      <PageContainer title="">
        <Stack spacing={2}>{[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={60} />)}</Stack>
      </PageContainer>
    );
  }

  if (error || !tournament) {
    return (
      <PageContainer title="Tournament Not Found">
        <Typography color="text.secondary">This tournament does not exist or could not be loaded.</Typography>
      </PageContainer>
    );
  }

  if (!tournament.isPublic) {
    return (
      <PageContainer title="Private Tournament">
        <Stack alignItems="center" spacing={2} py={8}>
          <LockOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
          <Typography color="text.secondary">This tournament is not publicly available.</Typography>
        </Stack>
      </PageContainer>
    );
  }

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

  return (
    <PageContainer title={tournament.name} subtitle={tournament.description || ""}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
        <EmojiEventsOutlinedIcon sx={{ color: "primary.main" }} />
        <TStatusChip status={tournament.status} />
        {tournament.format && <Chip size="small" label={tournament.format} variant="outlined" />}
        {tournament.startDate && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarMonthIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">{fmtDate(tournament.startDate)}</Typography>
            {tournament.endDate && <Typography variant="caption" color="text.secondary">→ {fmtDate(tournament.endDate)}</Typography>}
          </Stack>
        )}
      </Stack>

      {/* Stat strip */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
        {[
          { label: "Teams", value: tournament.teamIds?.length ?? 0 },
          { label: "Fixtures", value: fixtures?.length ?? "—" },
          { label: "Completed", value: completedMatches.length },
        ].map(s => (
          <Paper key={s.label} variant="outlined" sx={{ px: 2, py: 1, borderRadius: 1.5, minWidth: 80, textAlign: "center" }}>
            <Typography variant="h4" fontWeight={800}>{matchesLoading && s.label === "Completed" ? "—" : s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </Paper>
        ))}
      </Stack>

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: "divider", mb: 0 }}>
        <Tab label="Standings" icon={<LeaderboardIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 44, fontSize: "0.8rem" }} />
        <Tab label="Fixtures" icon={<CalendarMonthIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 44, fontSize: "0.8rem" }} />
        <Tab label="Teams" icon={<GroupsIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 44, fontSize: "0.8rem" }} />
        <Tab label="Statistics" icon={<BarChartIcon fontSize="small" />} iconPosition="start" sx={{ minHeight: 44, fontSize: "0.8rem" }} />
      </Tabs>

      {/* Standings */}
      <TabPanel value={activeTab} index={0}>
        <StandingsTable standings={standings} loading={matchesLoading} />
      </TabPanel>

      {/* Fixtures */}
      <TabPanel value={activeTab} index={1}>
        {fixturesLoading ? (
          <Stack spacing={1}>{[1,2,3].map(i => <Skeleton key={i} variant="rectangular" height={56} sx={{ borderRadius: 1 }} />)}</Stack>
        ) : !fixtures?.length ? (
          <Typography color="text.secondary" variant="body2">No fixtures scheduled yet.</Typography>
        ) : (
          <Stack spacing={1}>
            {[...fixtures]
              .sort((a, b) => (a.scheduledDate || "z") < (b.scheduledDate || "z") ? -1 : 1)
              .map((f) => {
                const derived = deriveFixtureStatus(f, matchesById);
                return (
                  <Paper key={f.fixtureId} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
                        <Typography variant="body2" fontWeight={800} noWrap>{f.teamAName} <span style={{ fontWeight: 400, opacity: 0.5 }}>vs</span> {f.teamBName}</Typography>
                        <FStatusChip status={derived} />
                      </Stack>
                      {f.scheduledDate && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <CalendarMonthIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>{f.scheduledDate}</Typography>
                        </Stack>
                      )}
                    </Box>
                    {f.matchId && matchesById.has(f.matchId) && (
                      <Chip
                        label={derived === FIXTURE_STATUS.LIVE ? "Watch Live" : "View"}
                        size="small"
                        clickable
                        onClick={() => navigate(derived === FIXTURE_STATUS.LIVE ? `/live/${f.matchId}` : `/scorecard/${f.matchId}`)}
                        color={derived === FIXTURE_STATUS.LIVE ? "error" : "default"}
                        variant="outlined"
                      />
                    )}
                  </Paper>
                );
              })}
          </Stack>
        )}
      </TabPanel>

      {/* Teams */}
      <TabPanel value={activeTab} index={2}>
        {!tournament.teamIds?.length ? (
          <Typography color="text.secondary" variant="body2">No teams added yet.</Typography>
        ) : (
          <Stack spacing={1}>
            {tournament.teamIds.map((t, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                <GroupsIcon sx={{ color: "text.disabled", fontSize: 18 }} />
                <Typography variant="body2" fontWeight={700}>{t.name || t}</Typography>
              </Paper>
            ))}
          </Stack>
        )}
      </TabPanel>

      {/* Statistics */}
      <TabPanel value={activeTab} index={3}>
        {matchesLoading ? (
          <Stack spacing={1}>{[1,2,3].map(i => <Skeleton key={i} height={40} />)}</Stack>
        ) : completedMatches.length === 0 ? (
          <Stack alignItems="center" spacing={1} py={4}>
            <BarChartIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography color="text.secondary">No completed matches yet.</Typography>
          </Stack>
        ) : (
          <Stack spacing={3}>
            {/* Overview */}
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {[
                { label: "Matches Played", value: overview.totalMatches },
                { label: "Total Runs", value: overview.totalRuns },
                { label: "Total Wickets", value: overview.totalWickets },
                overview.highestTeamScore && { label: "Highest Team Score", value: `${overview.highestTeamScore.runs}/${overview.highestTeamScore.wickets}`, sub: overview.highestTeamScore.teamName },
                overview.highestIndividualScore && { label: "Highest Individual", value: `${overview.highestIndividualScore.runs}${overview.highestIndividualScore.isOut ? "" : "*"}`, sub: `${overview.highestIndividualScore.name} (${overview.highestIndividualScore.teamName})` },
                overview.bestBowling && { label: "Best Bowling", value: `${overview.bestBowling.wickets}/${overview.bestBowling.runs}`, sub: `${overview.bestBowling.name} (${overview.bestBowling.teamName})` },
              ].filter(Boolean).map((s) => (
                <Paper key={s.label} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, minWidth: 120 }}>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">{s.label}</Typography>
                  {s.sub && <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: "0.62rem" }}>{s.sub}</Typography>}
                </Paper>
              ))}
            </Stack>

            {batters.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <SportsCricketIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="subtitle2" fontWeight={800}>Top Batters</Typography>
                  </Stack>
                  <LeaderTable
                    rows={batters}
                    cols={[{ key: "innings", label: "INN" }, { key: "runs", label: "RUNS" }, { key: "highestScore", label: "HS" }, { key: "average", label: "AVG" }, { key: "strikeRate", label: "SR" }]}
                    highlightIdx={1}
                  />
                </Box>
              </>
            )}

            {bowlers.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <SportsCricketIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <Typography variant="subtitle2" fontWeight={800}>Top Bowlers</Typography>
                  </Stack>
                  <LeaderTable
                    rows={bowlers}
                    cols={[{ key: "overs", label: "OVR" }, { key: "wickets", label: "WKTS" }, { key: "runs", label: "RUNS" }, { key: "economy", label: "ECO" }]}
                    highlightIdx={1}
                  />
                </Box>
              </>
            )}
          </Stack>
        )}
      </TabPanel>
    </PageContainer>
  );
};

export default PublicTournamentPage;
