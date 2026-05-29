import {
  MAX_OVERS,
  MAX_PLAYERS_PER_TEAM,
  MIN_OVERS,
  MIN_PLAYERS_PER_TEAM,
} from "../constants/matchCreation";

const trim = (value) => (typeof value === "string" ? value.trim() : value);

const normalizePlayerName = (name) => trim(name)?.toLowerCase();

export const findDuplicatePlayers = (players = []) => {
  const seen = new Set();
  const duplicates = [];
  players.forEach((player) => {
    const key = normalizePlayerName(player);
    if (!key) return;
    if (seen.has(key)) {
      duplicates.push(player);
    } else {
      seen.add(key);
    }
  });
  return [...new Set(duplicates)];
};

const validateTeamPlayers = (team, teamLabel) => {
  const errors = {};
  const players = (team?.players || []).map(trim).filter(Boolean);

  if (players.length < MIN_PLAYERS_PER_TEAM) {
    errors.players = `${teamLabel} needs at least ${MIN_PLAYERS_PER_TEAM} players.`;
  }
  if (players.length > MAX_PLAYERS_PER_TEAM) {
    errors.players = `${teamLabel} cannot have more than ${MAX_PLAYERS_PER_TEAM} players.`;
  }

  const duplicates = findDuplicatePlayers(players);
  if (duplicates.length) {
    errors.players = `Duplicate players in ${teamLabel}: ${duplicates.join(", ")}`;
  }

  if (team?.captain && !players.includes(team.captain)) {
    errors.captain = `Captain must be in ${teamLabel} playing list.`;
  }
  if (team?.wicketkeeper && !players.includes(team.wicketkeeper)) {
    errors.wicketkeeper = `Wicketkeeper must be in ${teamLabel} playing list.`;
  }

  return errors;
};

export const validateMatchDetailsStep = (matchDetails = {}) => {
  const errors = {};
  const teamA = trim(matchDetails.teamA);
  const teamB = trim(matchDetails.teamB);
  const venue = trim(matchDetails.venue);
  const dateTime = trim(matchDetails.dateTime);

  if (!teamA) {
    errors.teamA = "Team A name is required.";
  }
  if (!teamB) {
    errors.teamB = "Team B name is required.";
  }
  if (teamA && teamB && teamA.toLowerCase() === teamB.toLowerCase()) {
    errors.teamB = "Team names must be different.";
  }
  if (!dateTime) {
    errors.dateTime = "Match date and time is required.";
  } else {
    const selected = new Date(dateTime);
    if (Number.isNaN(selected.getTime())) {
      errors.dateTime = "Enter a valid date and time.";
    }
  }
  if (!venue) {
    errors.venue = "Venue is required.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateTeamsStep = (teams = {}, matchDetails = {}) => {
  const errors = {};
  const teamA = {
    ...teams.teamA,
    name: teams.teamA?.name || matchDetails.teamA,
    players: teams.teamA?.players || [],
  };
  const teamB = {
    ...teams.teamB,
    name: teams.teamB?.name || matchDetails.teamB,
    players: teams.teamB?.players || [],
  };

  const teamAErrors = validateTeamPlayers(teamA, "Team A");
  const teamBErrors = validateTeamPlayers(teamB, "Team B");

  if (Object.keys(teamAErrors).length) {
    errors.teamA = teamAErrors;
  }
  if (Object.keys(teamBErrors).length) {
    errors.teamB = teamBErrors;
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateTossStep = (tossDetails = {}, matchDetails = {}) => {
  const errors = {};
  const teamNames = [trim(matchDetails.teamA), trim(matchDetails.teamB)].filter(Boolean);

  if (!trim(tossDetails.winner)) {
    errors.winner = "Select the toss winner.";
  } else if (teamNames.length && !teamNames.includes(trim(tossDetails.winner))) {
    errors.winner = "Toss winner must match a team name.";
  }

  if (!trim(tossDetails.decision)) {
    errors.decision = "Select bat or bowl.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateRulesStep = (scoringRules = {}) => {
  const errors = {};
  const overs = Number(scoringRules.overs);
  const wide = Number(scoringRules.wide);
  const noBall = Number(scoringRules.noBall);

  if (!scoringRules.overs && scoringRules.overs !== 0) {
    errors.overs = "Overs per side is required.";
  } else if (Number.isNaN(overs) || overs < MIN_OVERS || overs > MAX_OVERS) {
    errors.overs = `Overs must be between ${MIN_OVERS} and ${MAX_OVERS}.`;
  }

  if (scoringRules.wide === "" || Number.isNaN(wide) || wide < 0) {
    errors.wide = "Wide runs must be 0 or more.";
  }
  if (scoringRules.noBall === "" || Number.isNaN(noBall) || noBall < 0) {
    errors.noBall = "No-ball runs must be 0 or more.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateNotesStep = () => ({ valid: true, errors: {} });

export const validateStep = (stepIndex, formData) => {
  switch (stepIndex) {
    case 0:
      return validateMatchDetailsStep(formData.matchDetails);
    case 1:
      return validateTeamsStep(formData.teams, formData.matchDetails);
    case 2:
      return validateTossStep(formData.tossDetails, formData.matchDetails);
    case 3:
      return validateRulesStep(formData.scoringRules);
    case 4:
      return validateNotesStep();
    case 5:
      return validateAllSteps(formData);
    default:
      return { valid: true, errors: {} };
  }
};

export const validateAllSteps = (formData) => {
  const results = [
    validateMatchDetailsStep(formData.matchDetails),
    validateTeamsStep(formData.teams, formData.matchDetails),
    validateTossStep(formData.tossDetails, formData.matchDetails),
    validateRulesStep(formData.scoringRules),
  ];

  const errors = {};
  const stepKeys = ["details", "teams", "toss", "rules"];

  results.forEach((result, index) => {
    if (!result.valid) {
      errors[stepKeys[index]] = result.errors;
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
};

export const getStepErrorMessage = (stepResult) => {
  if (!stepResult?.errors) {
    return "Please fix the highlighted fields before continuing.";
  }
  const firstKey = Object.keys(stepResult.errors)[0];
  const value = stepResult.errors[firstKey];
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object") {
    const nested = value[Object.keys(value)[0]];
    if (typeof nested === "string") {
      return nested;
    }
  }
  return "Please fix the highlighted fields before continuing.";
};
