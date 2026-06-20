import { formatOverFromBalls } from "./cricketScorecard";

export const computeTournamentBatting = (completedMatches = []) => {
  const totals = new Map();

  for (const match of completedMatches) {
    const innings = match.scoreCard?.innings;
    if (!Array.isArray(innings)) continue;

    for (const inning of innings) {
      const battingKey = inning.team;
      const teamName = match.teams?.[battingKey]?.name || battingKey || "";

      for (const batsman of inning.batsmen || []) {
        const name = (batsman.name || "").trim();
        if (!name) continue;
        const key = `${name.toLowerCase()}::${teamName.toLowerCase()}`;

        if (!totals.has(key)) {
          totals.set(key, { name, teamName, innings: 0, runs: 0, balls: 0, dismissed: 0, highestScore: 0 });
        }
        const acc = totals.get(key);
        acc.innings += 1;
        acc.runs += batsman.runs || 0;
        acc.balls += batsman.balls || 0;
        if (batsman.isOut) acc.dismissed += 1;
        acc.highestScore = Math.max(acc.highestScore, batsman.runs || 0);
      }
    }
  }

  return [...totals.values()]
    .map((acc) => ({
      name: acc.name,
      teamName: acc.teamName,
      innings: acc.innings,
      runs: acc.runs,
      balls: acc.balls,
      highestScore: acc.highestScore,
      average: acc.dismissed > 0 ? (acc.runs / acc.dismissed).toFixed(1) : acc.runs > 0 ? "N/O" : "—",
      strikeRate: acc.balls > 0 ? ((acc.runs / acc.balls) * 100).toFixed(1) : "—",
    }))
    .sort((a, b) => {
      if (b.runs !== a.runs) return b.runs - a.runs;
      return (parseFloat(b.average) || 0) - (parseFloat(a.average) || 0);
    })
    .slice(0, 10);
};

export const computeTournamentBowling = (completedMatches = []) => {
  const totals = new Map();

  for (const match of completedMatches) {
    const innings = match.scoreCard?.innings;
    if (!Array.isArray(innings)) continue;

    for (const inning of innings) {
      const battingKey = inning.team;
      const bowlingKey = battingKey === "teamA" ? "teamB" : "teamA";
      const teamName = match.teams?.[bowlingKey]?.name || bowlingKey || "";

      for (const bowler of inning.bowlers || []) {
        const name = (bowler.name || "").trim();
        if (!name) continue;
        const key = `${name.toLowerCase()}::${teamName.toLowerCase()}`;

        if (!totals.has(key)) {
          totals.set(key, { name, teamName, balls: 0, runs: 0, wickets: 0 });
        }
        const acc = totals.get(key);
        acc.balls += bowler.balls || 0;
        acc.runs += bowler.runs || 0;
        acc.wickets += bowler.wickets || 0;
      }
    }
  }

  return [...totals.values()]
    .filter((acc) => acc.balls > 0)
    .map((acc) => ({
      name: acc.name,
      teamName: acc.teamName,
      balls: acc.balls,
      overs: formatOverFromBalls(acc.balls),
      runs: acc.runs,
      wickets: acc.wickets,
      economy: acc.balls > 0 ? ((acc.runs / acc.balls) * 6).toFixed(2) : "—",
    }))
    .sort((a, b) => {
      if (b.wickets !== a.wickets) return b.wickets - a.wickets;
      return (parseFloat(a.economy) || 999) - (parseFloat(b.economy) || 999);
    })
    .slice(0, 10);
};

export const computeTournamentOverview = (completedMatches = []) => {
  let totalRuns = 0;
  let totalWickets = 0;
  let highestTeamScore = null;
  let highestIndividualScore = null;
  let bestBowling = null;

  for (const match of completedMatches) {
    const innings = match.scoreCard?.innings;
    if (!Array.isArray(innings)) continue;

    for (const inning of innings) {
      const battingKey = inning.team;
      const bowlingKey = battingKey === "teamA" ? "teamB" : "teamA";
      const battingTeam = match.teams?.[battingKey]?.name || battingKey || "";
      const bowlingTeam = match.teams?.[bowlingKey]?.name || bowlingKey || "";
      const inningRuns = inning.runs || 0;
      const inningWickets = inning.wickets || 0;

      totalRuns += inningRuns;
      totalWickets += inningWickets;

      if (!highestTeamScore || inningRuns > highestTeamScore.runs) {
        highestTeamScore = { runs: inningRuns, wickets: inningWickets, teamName: battingTeam, vs: bowlingTeam };
      }

      for (const batsman of inning.batsmen || []) {
        const runs = batsman.runs || 0;
        if (!highestIndividualScore || runs > highestIndividualScore.runs) {
          highestIndividualScore = { name: batsman.name || "Unknown", runs, isOut: batsman.isOut || false, teamName: battingTeam, vs: bowlingTeam };
        }
      }

      for (const bowler of inning.bowlers || []) {
        const wkts = bowler.wickets || 0;
        const runs = bowler.runs || 0;
        if (wkts === 0) continue;
        const isBetter = !bestBowling || wkts > bestBowling.wickets || (wkts === bestBowling.wickets && runs < bestBowling.runs);
        if (isBetter) {
          bestBowling = { name: bowler.name || "Unknown", wickets: wkts, runs, overs: formatOverFromBalls(bowler.balls || 0), teamName: bowlingTeam, vs: battingTeam };
        }
      }
    }
  }

  return { totalMatches: completedMatches.length, totalRuns, totalWickets, highestTeamScore, highestIndividualScore, bestBowling };
};
