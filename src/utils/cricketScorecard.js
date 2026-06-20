export const DISMISSAL_TYPES = {
  BOWLED: "Bowled",
  CAUGHT: "Caught",
  LBW: "LBW",
  RUN_OUT: "Run Out",
  STUMPED: "Stumped",
  HIT_WICKET: "Hit Wicket",
};

export const DISMISSALS_REQUIRING_FIELDER = [
  DISMISSAL_TYPES.CAUGHT,
  DISMISSAL_TYPES.RUN_OUT,
  DISMISSAL_TYPES.STUMPED,
];

export const formatOverFromBalls = (balls = 0) => {
  const legalBalls = Number.isFinite(balls) ? balls : 0;
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
};

export const formatDismissal = (player = {}) => {
  const type = player.dismissalType || player.wicketType;
  const fielder = player.fielder;
  const bowler = player.dismissalBowler || player.bowler;

  switch (type) {
    case DISMISSAL_TYPES.BOWLED:
      return bowler ? `b ${bowler}` : "b";
    case DISMISSAL_TYPES.CAUGHT:
      return `${fielder ? `c ${fielder} ` : "c "}${bowler ? `b ${bowler}` : ""}`.trim();
    case DISMISSAL_TYPES.LBW:
      return bowler ? `lbw b ${bowler}` : "lbw";
    case DISMISSAL_TYPES.RUN_OUT:
      return fielder ? `run out (${fielder})` : "run out";
    case DISMISSAL_TYPES.STUMPED:
      return `${fielder ? `st ${fielder} ` : "st "}${bowler ? `b ${bowler}` : ""}`.trim();
    case DISMISSAL_TYPES.HIT_WICKET:
      return bowler ? `hit wicket b ${bowler}` : "hit wicket";
    default:
      return player.dismissal || "";
  }
};

export const buildDismissalDetails = ({ dismissalType, fielder, bowler }) => ({
  dismissalType,
  fielder: fielder || "",
  dismissalBowler: bowler || "",
});
