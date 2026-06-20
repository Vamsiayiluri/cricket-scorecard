/**
 * Tournament standings calculation.
 *
 * Points: Win = 2, Tie = 1, Loss = 0
 * Sort order: Points desc → Wins desc → team name asc (alphabetical tiebreak)
 *
 * Only completed matches contribute to standings.
 * Winner is determined by:
 *   1. match.isTie === true → both teams get 1 point
 *   2. match.winnerTeamKey === "teamA" | "teamB" → winning team gets 2 points
 *   3. Fallback: match.winnerName string matched against team names
 *
 * allTeamNames seeds the table so teams with 0 matches played still appear.
 */

const POINTS = { win: 2, tie: 1, loss: 0 };

const ensureEntry = (map, name) => {
  if (!map[name]) {
    map[name] = { teamName: name, played: 0, won: 0, lost: 0, tied: 0, points: 0 };
  }
};

export const calculateStandings = (completedMatches = [], allTeamNames = []) => {
  const statsMap = {};

  for (const name of allTeamNames) {
    if (name) ensureEntry(statsMap, name);
  }

  for (const match of completedMatches) {
    const nameA = match?.teams?.teamA?.name;
    const nameB = match?.teams?.teamB?.name;
    if (!nameA || !nameB) continue;

    ensureEntry(statsMap, nameA);
    ensureEntry(statsMap, nameB);

    statsMap[nameA].played += 1;
    statsMap[nameB].played += 1;

    if (match.isTie === true) {
      statsMap[nameA].tied += 1;
      statsMap[nameB].tied += 1;
      statsMap[nameA].points += POINTS.tie;
      statsMap[nameB].points += POINTS.tie;
    } else if (match.winnerTeamKey === "teamA") {
      statsMap[nameA].won += 1;
      statsMap[nameB].lost += 1;
      statsMap[nameA].points += POINTS.win;
    } else if (match.winnerTeamKey === "teamB") {
      statsMap[nameB].won += 1;
      statsMap[nameA].lost += 1;
      statsMap[nameB].points += POINTS.win;
    } else if (match.winnerName) {
      // Fallback: match winnerName string to team names (case-sensitive)
      if (match.winnerName === nameA) {
        statsMap[nameA].won += 1;
        statsMap[nameB].lost += 1;
        statsMap[nameA].points += POINTS.win;
      } else if (match.winnerName === nameB) {
        statsMap[nameB].won += 1;
        statsMap[nameA].lost += 1;
        statsMap[nameB].points += POINTS.win;
      }
    }
    // If winner cannot be determined, played is still counted (no points awarded)
  }

  return Object.values(statsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    return a.teamName.localeCompare(b.teamName);
  });
};

/** Returns the current leader row (first entry with played > 0), or null. */
export const getLeader = (standings) =>
  standings.find((row) => row.played > 0) || null;
