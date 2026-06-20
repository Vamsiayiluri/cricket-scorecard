export const MATCH_CREATION_STEPS = [
  { id: "details", label: "Match Details" },
  { id: "teams", label: "Teams & Players" },
  { id: "toss", label: "Toss" },
  { id: "rules", label: "Scoring Rules" },
  { id: "notes", label: "Notes" },
  { id: "review", label: "Review" },
];

export const MATCH_TYPES = [
  { value: "T20", label: "T20" },
  { value: "ODI", label: "ODI / 50 Over" },
  { value: "T10", label: "T10" },
  { value: "Custom", label: "Custom" },
];

export const MIN_PLAYERS_PER_TEAM = 2;
export const MAX_PLAYERS_PER_TEAM = 15;
export const MIN_OVERS = 1;
export const MAX_OVERS = 50;

export const EMPTY_MATCH_FORM = {
  isPublic: true,
  matchDetails: {
    matchTitle: "",
    teamA: "",
    teamB: "",
    dateTime: "",
    venue: "",
    matchType: "T20",
  },
  teams: {
    teamA: { name: "", players: [], captain: "", wicketkeeper: "", newPlayer: "" },
    teamB: { name: "", players: [], captain: "", wicketkeeper: "", newPlayer: "" },
  },
  tossDetails: { winner: "", decision: "" },
  scoringRules: { overs: "", wide: 1, noBall: 1 },
  notes: "",
  tournamentId: "",
};
