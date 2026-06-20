/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import AppInput from "../components/ui/AppInput";
import AppButton from "../components/ui/AppButton";
import useDiscoverMatches from "../hooks/firebase/useDiscoverMatches";
import {
  formatMatchDate,
  getCompletedResultLine,
  getMatchTitle,
  isCompletedMatch,
} from "../utils/matchDisplay";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTeamName = (match, teamKey) =>
  match?.teams?.[teamKey]?.name || match?.matchDetails?.[teamKey] || teamKey;

const getInningLine = (match, inning) => {
  if (!inning) return null;
  const overs =
    typeof inning.overs === "number" ? inning.overs.toFixed(1) : "0.0";
  return {
    teamName: getTeamName(match, inning.team),
    score: `${inning.runs ?? 0}/${inning.wickets ?? 0}`,
    overs,
    isWinner: match.winnerTeamKey === inning.team,
  };
};

const getLiveScore = (match) => {
  const innings = match?.scoreCard?.innings || [];
  const idx = (match?.scoreCard?.currentInning || 1) - 1;
  const current = innings[idx];
  if (!current) return null;
  const overs =
    typeof current.overs === "number" ? current.overs.toFixed(1) : "0.0";
  return {
    teamName: getTeamName(match, current.team),
    score: `${current.runs ?? 0}/${current.wickets ?? 0}`,
    overs,
    maxOvers: match.scoringRules?.maxOvers,
    target: idx === 1 && innings[0] ? innings[0].runs + 1 : null,
  };
};

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, count }) => (
  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5 }}>
    {icon}
    <Typography variant="h4" sx={{ fontWeight: 800, flexGrow: 1 }}>
      {title}
    </Typography>
    {count !== undefined && (
      <Chip
        size="small"
        label={count}
        sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
      />
    )}
  </Stack>
);

// ─── Live card ────────────────────────────────────────────────────────────────

const LiveCard = ({ match }) => {
  const navigate = useNavigate();
  const matchId = match?.matchId || match?.id;
  const live = getLiveScore(match);
  const title = getMatchTitle(match);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 0,
        borderColor: "rgba(239,68,68,0.3)",
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "rgba(239,68,68,0.6)" },
      }}
    >
      {/* Red accent top bar */}
      <Box sx={{ height: 3, background: "linear-gradient(90deg, #EF4444, #F87171)" }} />

      <Box sx={{ p: 1.75 }}>
        {/* Live badge + match type */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#EF4444",
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "#EF4444",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontSize: "0.65rem",
              }}
            >
              Live
            </Typography>
          </Stack>
          {match.matchDetails?.matchType && (
            <Chip
              size="small"
              label={match.matchDetails.matchType}
              sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700 }}
            />
          )}
        </Stack>

        {/* Match title */}
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5, fontSize: "0.82rem" }}
        >
          {title}
        </Typography>

        {/* Current score */}
        {live ? (
          <Box sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography sx={{ fontWeight: 900, fontSize: "1.4rem", lineHeight: 1.1, color: "text.primary" }}>
                {live.score}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                ({live.overs}{live.maxOvers ? ` / ${live.maxOvers}` : ""} ov)
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#22C55E" }}>
              {live.teamName} batting
            </Typography>
            {live.target && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                Target: {live.target}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Score updating…
          </Typography>
        )}

        {match.matchDetails?.location && (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1, fontSize: "0.72rem" }}>
            📍 {match.matchDetails.location}
          </Typography>
        )}

        <AppButton
          size="small"
          variant="contained"
          fullWidth
          onClick={() => navigate(`/live/${matchId}`)}
          sx={{
            minHeight: 32,
            fontSize: "0.78rem",
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            "&:hover": { background: "linear-gradient(135deg, #DC2626, #B91C1C)" },
          }}
          startIcon={<LiveTvIcon sx={{ fontSize: "0.9rem !important" }} />}
        >
          Watch Live
        </AppButton>
      </Box>
    </Paper>
  );
};

// ─── Result card ──────────────────────────────────────────────────────────────

const ResultCard = ({ match }) => {
  const navigate = useNavigate();
  const matchId = match?.matchId || match?.id;
  const innings = match?.scoreCard?.innings || [];
  const lines = innings.map((inn) => getInningLine(match, inn)).filter(Boolean);
  const result = getCompletedResultLine(match);
  const potm = match?.playerOfTheMatch;
  const dateStr = match?.matchDetails?.date
    ? formatMatchDate(match.matchDetails.date)
    : null;
  const isTie = match?.isTie;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 0,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Box sx={{ height: 3, background: "linear-gradient(90deg, #22C55E, #4ADE80)" }} />

      <Box sx={{ p: 1.75 }}>
        {/* Status + date */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Chip
            size="small"
            label="Completed"
            sx={{
              height: 18,
              fontSize: "0.62rem",
              fontWeight: 800,
              bgcolor: "rgba(34,197,94,0.1)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          />
          {dateStr && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              {dateStr}
            </Typography>
          )}
        </Stack>

        {/* Innings score rows */}
        {lines.length > 0 ? (
          <Stack spacing={0.5} sx={{ mb: 1 }}>
            {lines.map((line, i) => (
              <Stack
                key={i}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  bgcolor: line.isWinner && !isTie
                    ? "rgba(245,158,11,0.07)"
                    : "transparent",
                  border: "1px solid",
                  borderColor: line.isWinner && !isTie
                    ? "rgba(245,158,11,0.2)"
                    : "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: line.isWinner && !isTie ? 800 : 600,
                    color: line.isWinner && !isTie ? "#F59E0B" : "text.primary",
                    fontSize: "0.84rem",
                    flexShrink: 0,
                    mr: 1,
                    maxWidth: "55%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {line.teamName}
                </Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1rem",
                      color: line.isWinner && !isTie ? "#FBBF24" : "text.primary",
                    }}
                  >
                    {line.score}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                    ({line.overs})
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Scorecard available
          </Typography>
        )}

        {/* Result line */}
        {result && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 700,
              color: isTie ? "text.secondary" : "#F59E0B",
              mb: potm ? 0.75 : 1,
              fontSize: "0.78rem",
            }}
          >
            {result}
          </Typography>
        )}

        {/* POTM */}
        {potm && (
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
            <EmojiEventsIcon sx={{ fontSize: 13, color: "#F59E0B" }} />
            <Typography
              variant="caption"
              sx={{ fontSize: "0.72rem", color: "text.secondary" }}
            >
              <span style={{ fontWeight: 700, color: "#FBBF24" }}>{potm}</span>
              &nbsp;· Player of the Match
            </Typography>
          </Stack>
        )}

        <AppButton
          size="small"
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/scorecard/${matchId}`)}
          sx={{ minHeight: 32, fontSize: "0.78rem" }}
        >
          View Scorecard
        </AppButton>
      </Box>
    </Paper>
  );
};

// ─── Upcoming card ────────────────────────────────────────────────────────────

const UpcomingCard = ({ match }) => {
  const navigate = useNavigate();
  const matchId = match?.matchId || match?.id;
  const dateStr = match?.matchDetails?.date
    ? formatMatchDate(match.matchDetails.date)
    : "Date TBD";
  const teamA =
    match?.teams?.teamA?.name || match?.matchDetails?.teamA || "Team A";
  const teamB =
    match?.teams?.teamB?.name || match?.matchDetails?.teamB || "Team B";

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.75,
        borderColor: "divider",
        borderRadius: 2,
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      {/* Status + date */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Chip
          size="small"
          label="Upcoming"
          sx={{
            height: 18,
            fontSize: "0.62rem",
            fontWeight: 800,
            bgcolor: "rgba(56,189,248,0.1)",
            color: "#38BDF8",
            border: "1px solid rgba(56,189,248,0.2)",
          }}
        />
        {match.matchDetails?.matchType && (
          <Chip
            size="small"
            label={match.matchDetails.matchType}
            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700 }}
          />
        )}
      </Stack>

      {/* Teams */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            fontSize: "0.95rem",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {teamA}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 900,
            color: "text.disabled",
            fontSize: "0.7rem",
            flexShrink: 0,
          }}
        >
          vs
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            fontSize: "0.95rem",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "right",
          }}
        >
          {teamB}
        </Typography>
      </Stack>

      <Stack spacing={0.25} sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
          🗓 {dateStr}
        </Typography>
        {match.matchDetails?.location && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            📍 {match.matchDetails.location}
          </Typography>
        )}
        {match.scoringRules?.maxOvers && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            🏏 {match.scoringRules.maxOvers} overs
          </Typography>
        )}
      </Stack>

      <AppButton
        size="small"
        variant="outlined"
        fullWidth
        onClick={() => navigate(`/scorecard/${matchId}`)}
        sx={{ minHeight: 32, fontSize: "0.78rem" }}
      >
        View Details
      </AppButton>
    </Paper>
  );
};

// ─── Search result card ───────────────────────────────────────────────────────

const SearchResultCard = ({ match }) => {
  const navigate = useNavigate();
  const matchId = match?.matchId || match?.id;
  const completed = isCompletedMatch(match);
  const title = getMatchTitle(match);
  const result = completed ? getCompletedResultLine(match) : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderColor: "divider",
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        transition: "border-color 0.2s",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {title}
        </Typography>
        {result && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            {result}
          </Typography>
        )}
        {!completed && match.matchDetails?.date && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            {formatMatchDate(match.matchDetails.date)}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
        <Chip
          size="small"
          label={completed ? "Result" : match.status === "in-progress" ? "Live" : "Upcoming"}
          sx={{
            height: 18,
            fontSize: "0.6rem",
            fontWeight: 800,
            bgcolor: completed
              ? "rgba(34,197,94,0.1)"
              : match.status === "in-progress"
              ? "rgba(239,68,68,0.1)"
              : "rgba(56,189,248,0.1)",
            color: completed
              ? "#22C55E"
              : match.status === "in-progress"
              ? "#EF4444"
              : "#38BDF8",
          }}
        />
        <Button
          size="small"
          variant="outlined"
          sx={{ minHeight: 24, py: 0, px: 1.25, fontSize: "0.7rem", borderRadius: 1 }}
          onClick={() =>
            navigate(
              match.status === "in-progress"
                ? `/live/${matchId}`
                : `/scorecard/${matchId}`
            )
          }
        >
          Open
        </Button>
      </Stack>
    </Paper>
  );
};

// ─── Skeletons ────────────────────────────────────────────────────────────────

const CardSkeleton = () => (
  <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2, borderColor: "divider" }}>
    <Skeleton variant="text" width="40%" height={16} sx={{ mb: 0.75 }} />
    <Skeleton variant="text" width="70%" height={28} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="55%" height={16} sx={{ mb: 1.25 }} />
    <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1 }} />
  </Paper>
);

// ─── Empty section state ──────────────────────────────────────────────────────

const EmptySection = ({ message }) => (
  <Paper
    variant="outlined"
    sx={{ p: 2.5, textAlign: "center", borderColor: "divider", borderRadius: 2 }}
  >
    <SportsCricketIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.75 }} />
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  </Paper>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const DiscoverPage = () => {
  const { live, results, upcoming, all, loading, error } = useDiscoverMatches();
  const [search, setSearch] = useState("");

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return all.filter((m) => {
      const a = (m.teams?.teamA?.name || m.matchDetails?.teamA || "").toLowerCase();
      const b = (m.teams?.teamB?.name || m.matchDetails?.teamB || "").toLowerCase();
      const title = (m.matchDetails?.title || "").toLowerCase();
      return a.includes(q) || b.includes(q) || title.includes(q);
    });
  }, [search, all]);

  const isSearching = Boolean(search.trim());

  return (
    <Box sx={{ maxWidth: 1040, mx: "auto", px: { xs: 0, sm: 0 } }}>
      {/* Page header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <ExploreIcon sx={{ color: "primary.main", fontSize: 26 }} />
            <Typography variant="h2" sx={{ fontWeight: 850, letterSpacing: "-0.02em" }}>
              Discover Matches
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Browse live cricket, recent results, and upcoming fixtures from the CricVelo community.
          </Typography>
        </Box>
      </Stack>

      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <AppInput
          placeholder="Search by team name or match title…"
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
          sx={{ maxWidth: 520 }}
        />
      </Box>

      {/* Error state */}
      {error && !loading && (
        <Paper
          variant="outlined"
          sx={{ p: 3, textAlign: "center", borderColor: "divider", mb: 3 }}
        >
          <Typography variant="body2" color="text.secondary">
            Unable to load matches. Please check your connection and try again.
          </Typography>
        </Paper>
      )}

      {/* ── Search results ── */}
      {isSearching && !loading && (
        <Box sx={{ mb: 4 }}>
          <SectionHeader
            icon={<SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />}
            title={`Search results for "${search}"`}
            count={searchResults?.length ?? 0}
          />
          {searchResults?.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{ p: 2.5, textAlign: "center", borderColor: "divider", borderRadius: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                No public matches found for &quot;{search}&quot;.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={1}>
              {searchResults.map((m) => (
                <SearchResultCard key={m.matchId || m.id} match={m} />
              ))}
            </Stack>
          )}
        </Box>
      )}

      {!isSearching && (
        <Stack spacing={4}>
          {/* ── Live Now ── */}
          <Box>
            <SectionHeader
              icon={<LiveTvIcon sx={{ fontSize: 20, color: "#EF4444" }} />}
              title="Live Now"
              count={loading ? undefined : live.length}
            />
            {loading ? (
              <Grid container spacing={1.5}>
                {[0, 1].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <CardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : live.length === 0 ? (
              <EmptySection message="No matches are live right now. Check back soon!" />
            ) : (
              <Grid container spacing={1.5}>
                {live.map((m) => (
                  <Grid item xs={12} sm={6} md={4} key={m.matchId || m.id}>
                    <LiveCard match={m} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* ── Recent Results ── */}
          <Box>
            <SectionHeader
              icon={<EmojiEventsIcon sx={{ fontSize: 20, color: "#F59E0B" }} />}
              title="Recent Results"
              count={loading ? undefined : results.length}
            />
            {loading ? (
              <Grid container spacing={1.5}>
                {[0, 1, 2].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <CardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : results.length === 0 ? (
              <EmptySection message="No completed matches yet." />
            ) : (
              <Grid container spacing={1.5}>
                {results.map((m) => (
                  <Grid item xs={12} sm={6} md={4} key={m.matchId || m.id}>
                    <ResultCard match={m} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* ── Upcoming Fixtures ── */}
          <Box>
            <SectionHeader
              icon={<EventIcon sx={{ fontSize: 20, color: "#38BDF8" }} />}
              title="Upcoming Fixtures"
              count={loading ? undefined : upcoming.length}
            />
            {loading ? (
              <Grid container spacing={1.5}>
                {[0, 1].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <CardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : upcoming.length === 0 ? (
              <EmptySection message="No upcoming fixtures announced." />
            ) : (
              <Grid container spacing={1.5}>
                {upcoming.map((m) => (
                  <Grid item xs={12} sm={6} md={4} key={m.matchId || m.id}>
                    <UpcomingCard match={m} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default DiscoverPage;
