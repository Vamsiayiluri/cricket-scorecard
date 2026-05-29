/**
 * Presentation helpers for dashboard and list views.
 */

export const getMatchTitle = (match) => {
  const teamA = match?.matchDetails?.teamA || match?.teams?.teamA?.name || "Team A";
  const teamB = match?.matchDetails?.teamB || match?.teams?.teamB?.name || "Team B";
  return `${teamA} vs ${teamB}`;
};

export const formatMatchDate = (value) => {
  if (!value) {
    return "Date TBD";
  }

  const date = value?.toDate?.() ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date TBD";
  }

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const getCurrentInningSummary = (match) => {
  const innings = match?.scoreCard?.innings;
  if (!Array.isArray(innings) || innings.length === 0) {
    return null;
  }

  const currentIndex = (match?.scoreCard?.currentInning || 1) - 1;
  const inning = innings[currentIndex] || innings[innings.length - 1];
  if (!inning) {
    return null;
  }

  const overs = typeof inning.overs === "number" ? inning.overs.toFixed(1) : "0.0";
  return `${inning.runs || 0}/${inning.wickets || 0} in ${overs} overs`;
};

const getTeamWicketLimit = (match, teamKey) => {
  const players = match?.teams?.[teamKey]?.players;
  return Array.isArray(players) && players.length > 1 ? players.length - 1 : 10;
};

export const isCompletedMatch = (match) =>
  match?.status === "completed" ||
  Boolean(
    match?.completedAt ||
      match?.resultSummary ||
      match?.winnerName ||
      match?.winnerTeamKey ||
      match?.isTie === true
  );

export const getCompletedResultLine = (match) => {
  if (match?.resultSummary) {
    return match.resultSummary;
  }

  if (match?.isTie === true) {
    return "Match tied";
  }

  if (match?.winnerName && match?.margin) {
    return `${match.winnerName} ${match.margin}`;
  }

  const innings = match?.scoreCard?.innings;
  if (!Array.isArray(innings) || innings.length < 2) {
    return "Match completed";
  }

  const first = innings[0];
  const second = innings[1];
  if (!first || !second) {
    return "Match completed";
  }

  if (second.runs > first.runs) {
    const wicketsLeft = Math.max(
      0,
      getTeamWicketLimit(match, second.team) - (second.wickets || 0)
    );
    return `Chase completed (${second.runs}/${second.wickets}) — ${wicketsLeft} wickets in hand`;
  }
  if (second.runs < first.runs) {
    return `Defended ${first.runs} — target ${first.runs + 1}`;
  }
  return "Match tied";
};

export const getMatchScoreLine = (match) => {
  if (isCompletedMatch(match)) {
    return getCompletedResultLine(match);
  }

  const summary = getCurrentInningSummary(match);
  return summary || "Not started";
};

export const getMatchOutcome = (match) => {
  if (match?.resultSummary || match?.winnerName || match?.isTie === true) {
    return {
      winner: match?.isTie ? null : match?.winnerName || null,
      margin: match?.margin || match?.resultSummary || "Match completed",
      isTie: Boolean(match?.isTie),
    };
  }

  const innings = match?.scoreCard?.innings;
  if (!Array.isArray(innings) || innings.length < 2) {
    return {
      winner: null,
      margin: "Match completed",
      isTie: false,
    };
  }
  const first = innings[0];
  const second = innings[1];
  const firstTeamName = match?.teams?.[first?.team]?.name || "Team A";
  const secondTeamName = match?.teams?.[second?.team]?.name || "Team B";

  if ((second?.runs || 0) > (first?.runs || 0)) {
    const wicketsInHand = Math.max(
      0,
      getTeamWicketLimit(match, second?.team) - (second?.wickets || 0)
    );
    return {
      winner: secondTeamName,
      margin: `won by ${wicketsInHand} wickets`,
      isTie: false,
    };
  }
  if ((second?.runs || 0) < (first?.runs || 0)) {
    const runsMargin = (first?.runs || 0) - (second?.runs || 0);
    return {
      winner: firstTeamName,
      margin: `won by ${runsMargin} runs`,
      isTie: false,
    };
  }
  return {
    winner: null,
    margin: "Match tied",
    isTie: true,
  };
};

export const getMatchResultHeadline = (match) => getCompletedResultLine(match);

export const buildMatchCompletionFields = (match) => {
  const innings = match?.scoreCard?.innings;
  const outcome = getMatchOutcome(match);
  const first = Array.isArray(innings) ? innings[0] : null;
  const second = Array.isArray(innings) ? innings[1] : null;
  const winnerTeamKey =
    outcome.isTie || !first || !second
      ? null
      : (second?.runs || 0) > (first?.runs || 0)
      ? second.team
      : first.team;
  const resultSummary = outcome.isTie
    ? "Match tied"
    : outcome?.winner
    ? `${outcome.winner} ${outcome.margin}`
    : outcome.margin;

  return {
    status: "completed",
    completedAt: new Date(),
    resultSummary,
    winnerTeamKey,
    winnerName: outcome.isTie ? null : outcome.winner,
    margin: outcome.margin,
    isTie: Boolean(outcome.isTie),
  };
};

export const getMatchRoute = (match, { isScorer = true } = {}) => {
  const matchId = match?.matchId || match?.id;
  if (!matchId) {
    return "/dashboard";
  }

  if (!isScorer) {
    return `/scorecard/${matchId}`;
  }

  if (match?.status === "scheduled") {
    return `/start-match?matchId=${matchId}`;
  }
  return `/score-card?matchId=${matchId}`;
};

export const getPublicLiveRoute = (matchId) => `/live/${matchId}`;
export const getPublicScorecardRoute = (matchId) => `/scorecard/${matchId}`;

export const isPublicMatch = (match) => match?.isPublic !== false;
