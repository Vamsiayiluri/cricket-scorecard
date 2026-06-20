/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SportsIcon from "@mui/icons-material/Sports";
import PageContainer from "../components/ui/PageContainer";
import AppButton from "../components/ui/AppButton";
import { getPlayerById } from "../services/firebase/playerService";
import useCompletedMatches from "../hooks/firebase/useCompletedMatches";
import {
  computePlayerStats,
  getRecentMatchAppearances,
  EMPTY_BATTING,
  EMPTY_BOWLING,
} from "../utils/playerStats";

const ROLE_COLORS = {
  Batsman: "primary",
  Bowler: "success",
  "All-rounder": "secondary",
  "Wicket-keeper": "warning",
};

const StatCell = ({ value, secondary }) => (
  <TableCell align="center">
    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
      {value ?? "—"}
    </Typography>
    {secondary != null && (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.65rem" }}>
        {secondary}
      </Typography>
    )}
  </TableCell>
);

const StatCard = ({ label, value, sub }) => (
  <Paper
    variant="outlined"
    sx={{ p: 1.5, textAlign: "center", borderColor: "divider", borderRadius: 2 }}
  >
    <Typography variant="h3" sx={{ fontWeight: 850, lineHeight: 1 }}>
      {value ?? "—"}
    </Typography>
    {sub && (
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
        {sub}
      </Typography>
    )}
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, fontSize: "0.68rem" }}>
      {label}
    </Typography>
  </Paper>
);

const getMatchTitle = (match) =>
  match?.matchDetails?.title ||
  `${match?.teams?.teamA?.name || "Team A"} vs ${match?.teams?.teamB?.name || "Team B"}`;

const getMatchDate = (match) => {
  const raw = match?.matchDetails?.date || match?.createdAt;
  if (!raw) return null;
  try {
    const d = raw?.toDate ? raw.toDate() : new Date(raw);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return null;
  }
};

const PlayerProfilePage = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [playerLoading, setPlayerLoading] = useState(true);
  const [playerError, setPlayerError] = useState(null);

  const { matches, loading: matchesLoading } = useCompletedMatches();

  useEffect(() => {
    if (!playerId) return;
    setPlayerLoading(true);
    getPlayerById(playerId)
      .then((p) => {
        setPlayer(p);
        if (!p) setPlayerError("Player not found.");
      })
      .catch(() => setPlayerError("Failed to load player."))
      .finally(() => setPlayerLoading(false));
  }, [playerId]);

  const loading = playerLoading || matchesLoading;

  const { batting, bowling } = loading
    ? { batting: { ...EMPTY_BATTING }, bowling: { ...EMPTY_BOWLING } }
    : computePlayerStats(matches, playerId);

  const recentAppearances = loading ? [] : getRecentMatchAppearances(matches, playerId, 5);

  const hasBatting = batting.innings > 0;
  const hasBowling = bowling.balls > 0;

  if (playerError) {
    return (
      <PageContainer title="Player not found">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {playerError}
        </Typography>
        <AppButton startIcon={<ArrowBackIcon />} onClick={() => navigate("/players")}>
          Back to Players
        </AppButton>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2, fontSize: "0.85rem" }}>
        <Link component={RouterLink} to="/players" underline="hover" color="inherit">
          My Players
        </Link>
        <Typography color="text.primary" sx={{ fontSize: "0.85rem" }}>
          {player?.name || "…"}
        </Typography>
      </Breadcrumbs>

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
          <CircularProgress size={36} />
        </Stack>
      ) : (
        <Stack spacing={3} sx={{ maxWidth: 960 }}>
          {/* Player identity */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 850, lineHeight: 1.1 }}>
                {player?.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.5 }}>
                {player?.role && (
                  <Chip
                    size="small"
                    label={player.role}
                    color={ROLE_COLORS[player.role] || "default"}
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.68rem" }}
                  />
                )}
                {player?.battingStyle && (
                  <Chip
                    size="small"
                    label={player.battingStyle}
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.68rem" }}
                  />
                )}
                {player?.bowlingStyle && (
                  <Chip
                    size="small"
                    label={player.bowlingStyle}
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.68rem" }}
                  />
                )}
              </Stack>
            </Box>
            <AppButton
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/players")}
              variant="outlined"
              size="small"
              sx={{ flexShrink: 0 }}
            >
              All Players
            </AppButton>
          </Stack>

          {/* Quick stats row */}
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={3}>
              <StatCard label="Matches" value={batting.matches || bowling.balls > 0 ? Math.max(batting.matches, recentAppearances.length) : 0} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard label="Runs" value={batting.runs} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard label="Wickets" value={bowling.wickets} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                label="Avg / SR"
                value={batting.average ?? "—"}
                sub={batting.strikeRate ? `SR ${batting.strikeRate}` : undefined}
              />
            </Grid>
          </Grid>

          {/* No stats notice */}
          {!hasBatting && !hasBowling && (
            <Paper
              variant="outlined"
              sx={{ p: 3, textAlign: "center", borderColor: "divider" }}
            >
              <SportsIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No match appearances recorded yet. Stats appear once this player is linked to a completed match.
              </Typography>
            </Paper>
          )}

          {/* Batting stats */}
          {hasBatting && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Batting
              </Typography>
              <Paper variant="outlined" sx={{ borderColor: "divider", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                      {["Mat", "Inn", "Runs", "HS", "Avg", "SR", "4s", "6s", "NO"].map((h) => (
                        <TableCell key={h} align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, color: "text.secondary" }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <StatCell value={batting.matches} />
                      <StatCell value={batting.innings} />
                      <StatCell value={batting.runs} />
                      <StatCell value={batting.highestScore} />
                      <StatCell value={batting.average ?? "—"} />
                      <StatCell value={batting.strikeRate ?? "—"} />
                      <StatCell value={batting.fours} />
                      <StatCell value={batting.sixes} />
                      <StatCell value={batting.notOuts} />
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* Bowling stats */}
          {hasBowling && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Bowling
              </Typography>
              <Paper variant="outlined" sx={{ borderColor: "divider", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                      {["Overs", "Runs", "Wickets", "Economy"].map((h) => (
                        <TableCell key={h} align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 0.75, color: "text.secondary" }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <StatCell value={bowling.overs} />
                      <StatCell value={bowling.runs} />
                      <StatCell value={bowling.wickets} />
                      <StatCell value={bowling.economy ?? "—"} />
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* Recent appearances */}
          {recentAppearances.length > 0 && (
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                Recent Appearances
              </Typography>
              <Stack spacing={1}>
                {recentAppearances.map(({ match, batStats, bowlStats }, i) => (
                  <Paper
                    key={match?.matchId || match?.id || i}
                    variant="outlined"
                    sx={{ p: 1.5, borderColor: "divider", borderRadius: 1.5 }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.88rem" }}>
                          {getMatchTitle(match)}
                        </Typography>
                        {getMatchDate(match) && (
                          <Typography variant="caption" color="text.secondary">
                            {getMatchDate(match)}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        {batStats && (
                          <Chip
                            size="small"
                            label={`${batStats.runs}${batStats.isOut ? "" : "*"} (${batStats.balls}b)${batStats.fours ? ` ${batStats.fours}×4` : ""}${batStats.sixes ? ` ${batStats.sixes}×6` : ""}`}
                            color="primary"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.7rem", fontFamily: "monospace" }}
                          />
                        )}
                        {bowlStats && (
                          <Chip
                            size="small"
                            label={`${bowlStats.wickets}/${bowlStats.runs} (${bowlStats.overs}ov)`}
                            color="success"
                            variant="outlined"
                            sx={{ height: 22, fontSize: "0.7rem", fontFamily: "monospace" }}
                          />
                        )}
                      </Stack>
                    </Stack>
                    {match?.resultSummary && (
                      <>
                        <Divider sx={{ my: 0.75 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {match.resultSummary}
                        </Typography>
                      </>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </PageContainer>
  );
};

export default PlayerProfilePage;
