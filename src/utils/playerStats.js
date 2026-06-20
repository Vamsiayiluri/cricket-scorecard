import { isCompletedMatch } from "./matchDisplay";
import { formatOverFromBalls } from "./cricketScorecard";

/**
 * Build a name (lowercase) → playerId map from a team's playerRefs.
 * Entries with null playerId are excluded — they are manual-entry players.
 */
const buildRefMap = (playerRefs = []) => {
  const map = new Map();
  for (const ref of playerRefs) {
    if (ref.playerId) {
      map.set((ref.name || "").toLowerCase(), ref.playerId);
    }
  }
  return map;
};

/** Find the playerId for a player name (case-insensitive) in a ref array. */
const resolvePlayerId = (playerRefs = [], playerId) =>
  playerRefs.find((r) => r.playerId === playerId) || null;

const sortByUpdatedDesc = (a, b) => {
  const at = a?.updatedAt?.toMillis?.() ?? new Date(a?.updatedAt || 0).getTime();
  const bt = b?.updatedAt?.toMillis?.() ?? new Date(b?.updatedAt || 0).getTime();
  return bt - at;
};

// ─── Accumulators ────────────────────────────────────────────────────────────

const accumBatting = (totals, inning, refMap, matchId) => {
  for (const batsman of inning.batsmen || []) {
    const playerId = refMap.get((batsman.name || "").toLowerCase());
    if (!playerId) continue;

    if (!totals.has(playerId)) {
      totals.set(playerId, {
        matchIds: new Set(),
        innings: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        highestScore: 0,
        dismissed: 0,
        notOuts: 0,
      });
    }

    const acc = totals.get(playerId);
    acc.matchIds.add(matchId);
    acc.innings += 1;
    acc.runs += batsman.runs || 0;
    acc.balls += batsman.balls || 0;
    acc.fours += batsman.fours || 0;
    acc.sixes += batsman.sixes || 0;
    acc.highestScore = Math.max(acc.highestScore, batsman.runs || 0);
    batsman.isOut ? (acc.dismissed += 1) : (acc.notOuts += 1);
  }
};

const accumBowling = (totals, inning, refMap) => {
  for (const bowler of inning.bowlers || []) {
    const playerId = refMap.get((bowler.name || "").toLowerCase());
    if (!playerId) continue;

    if (!totals.has(playerId)) {
      totals.set(playerId, { balls: 0, runs: 0, wickets: 0 });
    }

    const acc = totals.get(playerId);
    acc.balls += bowler.balls || 0;
    acc.runs += bowler.runs || 0;
    acc.wickets += bowler.wickets || 0;
  }
};

// ─── Derivations ─────────────────────────────────────────────────────────────

const deriveBatting = (acc) => ({
  matches: acc.matchIds.size,
  innings: acc.innings,
  runs: acc.runs,
  balls: acc.balls,
  fours: acc.fours,
  sixes: acc.sixes,
  highestScore: acc.highestScore,
  notOuts: acc.notOuts,
  average: acc.dismissed > 0 ? (acc.runs / acc.dismissed).toFixed(2) : null,
  strikeRate: acc.balls > 0 ? ((acc.runs / acc.balls) * 100).toFixed(1) : null,
  matchIds: [...acc.matchIds],
});

const deriveBowling = (acc) => ({
  balls: acc.balls,
  overs: formatOverFromBalls(acc.balls),
  runs: acc.runs,
  wickets: acc.wickets,
  economy: acc.balls > 0 ? ((acc.runs / acc.balls) * 6).toFixed(2) : null,
});

// ─── Public API ──────────────────────────────────────────────────────────────

export const EMPTY_BATTING = {
  matches: 0,
  innings: 0,
  runs: 0,
  balls: 0,
  fours: 0,
  sixes: 0,
  highestScore: 0,
  notOuts: 0,
  average: null,
  strikeRate: null,
  matchIds: [],
};

export const EMPTY_BOWLING = {
  balls: 0,
  overs: "0.0",
  runs: 0,
  wickets: 0,
  economy: null,
};

/**
 * Compute batting and bowling stats for every linked player (playerId ≠ null)
 * across all completed matches.
 *
 * @param {object[]} matches
 * @returns {Map<string, { batting, bowling }>}  keyed by playerId
 */
export const computeAllPlayerStats = (matches = []) => {
  const battingTotals = new Map();
  const bowlingTotals = new Map();

  for (const match of matches.filter(isCompletedMatch)) {
    const innings = match.scoreCard?.innings;
    if (!Array.isArray(innings)) continue;
    const matchId = match.matchId || match.id;

    for (const inning of innings) {
      const battingKey = inning.team; // "teamA" | "teamB"
      if (!battingKey) continue;
      const bowlingKey = battingKey === "teamA" ? "teamB" : "teamA";

      accumBatting(
        battingTotals,
        inning,
        buildRefMap(match.teams?.[battingKey]?.playerRefs),
        matchId
      );
      accumBowling(
        bowlingTotals,
        inning,
        buildRefMap(match.teams?.[bowlingKey]?.playerRefs)
      );
    }
  }

  const result = new Map();
  const allIds = new Set([...battingTotals.keys(), ...bowlingTotals.keys()]);

  for (const playerId of allIds) {
    result.set(playerId, {
      batting: battingTotals.has(playerId)
        ? deriveBatting(battingTotals.get(playerId))
        : { ...EMPTY_BATTING },
      bowling: bowlingTotals.has(playerId)
        ? deriveBowling(bowlingTotals.get(playerId))
        : { ...EMPTY_BOWLING },
    });
  }

  return result;
};

/**
 * Compute stats for a single player.
 */
export const computePlayerStats = (matches = [], playerId) => {
  if (!playerId) return { batting: { ...EMPTY_BATTING }, bowling: { ...EMPTY_BOWLING } };
  const map = computeAllPlayerStats(matches);
  return map.get(playerId) ?? { batting: { ...EMPTY_BATTING }, bowling: { ...EMPTY_BOWLING } };
};

/**
 * Return the most recent completed match appearances for a player (batting or
 * bowling). Manual-entry players without a playerId in refs are skipped.
 *
 * @param {object[]} matches
 * @param {string}   playerId
 * @param {number}   limit
 * @returns {{ match, batStats, bowlStats }[]}
 */
export const getRecentMatchAppearances = (matches = [], playerId, limit = 5) => {
  if (!playerId) return [];

  const appearances = [];

  const completed = [...matches]
    .filter(isCompletedMatch)
    .sort(sortByUpdatedDesc);

  for (const match of completed) {
    if (appearances.length >= limit) break;

    const innings = match.scoreCard?.innings;
    if (!Array.isArray(innings)) continue;

    let batStats = null;
    let bowlStats = null;

    for (const inning of innings) {
      const battingKey = inning.team;
      if (!battingKey) continue;
      const bowlingKey = battingKey === "teamA" ? "teamB" : "teamA";

      // Batting appearance
      const battingRef = resolvePlayerId(match.teams?.[battingKey]?.playerRefs, playerId);
      if (battingRef) {
        const batsman = (inning.batsmen || []).find(
          (b) => (b.name || "").toLowerCase() === (battingRef.name || "").toLowerCase()
        );
        if (batsman) {
          batStats = {
            runs: batsman.runs || 0,
            balls: batsman.balls || 0,
            fours: batsman.fours || 0,
            sixes: batsman.sixes || 0,
            isOut: Boolean(batsman.isOut),
          };
        }
      }

      // Bowling appearance
      const bowlingRef = resolvePlayerId(match.teams?.[bowlingKey]?.playerRefs, playerId);
      if (bowlingRef) {
        const bowler = (inning.bowlers || []).find(
          (b) => (b.name || "").toLowerCase() === (bowlingRef.name || "").toLowerCase()
        );
        if (bowler) {
          bowlStats = {
            balls: bowler.balls || 0,
            overs: formatOverFromBalls(bowler.balls || 0),
            runs: bowler.runs || 0,
            wickets: bowler.wickets || 0,
          };
        }
      }
    }

    if (batStats || bowlStats) {
      appearances.push({ match, batStats, bowlStats });
    }
  }

  return appearances;
};
