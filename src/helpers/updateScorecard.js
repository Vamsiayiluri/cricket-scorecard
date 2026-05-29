import { scoringLog, scoringWarn } from "../utils/scoringDiagnostics";

const sanitizeExtras = (extras = {}) => {
  const normalized = {
    wide: Boolean(extras.wide),
    noBall: Boolean(extras.noBall),
    byes: Boolean(extras.byes),
    legByes: Boolean(extras.legByes),
    wicket: Boolean(extras.wicket),
  };

  if (normalized.wide) {
    normalized.noBall = false;
    normalized.byes = false;
    normalized.legByes = false;
  }
  if (normalized.noBall) {
    normalized.wide = false;
  }
  if (normalized.byes) {
    normalized.wide = false;
    normalized.legByes = false;
  }
  if (normalized.legByes) {
    normalized.wide = false;
    normalized.byes = false;
  }

  return normalized;
};

export const handleExtraChange = (event, setExtras) => {
  const { name, checked } = event.target;

  setExtras((prevExtras) => {
    const updatedExtras = { ...prevExtras };

    switch (name) {
      case "wide":
        updatedExtras.wide = checked;
        if (checked) {
          updatedExtras.byes = false;
          updatedExtras.legByes = false;
          updatedExtras.noBall = false;
        }
        break;

      case "byes":
        updatedExtras.byes = checked;
        if (checked) {
          updatedExtras.wide = false;
          updatedExtras.legByes = false;
        }
        break;

      case "legByes":
        updatedExtras.legByes = checked;
        if (checked) {
          updatedExtras.wide = false;
          updatedExtras.byes = false;
        }
        break;

      case "noBall":
        updatedExtras.noBall = checked;
        if (checked) {
          updatedExtras.wide = false;
        }
        break;

      case "wicket":
        updatedExtras.wicket = checked;
        break;

      default:
        break;
    }

    return updatedExtras;
  });
};
export const updateScoreCard = (scoreCard, action, payload) => {
  const normalizedPayload =
    payload?.extras != null
      ? { ...payload, extras: sanitizeExtras(payload.extras) }
      : payload;
  scoringLog("scorecard.mutation.request", {
    action,
    currentInning: scoreCard?.currentInning,
    runs: normalizedPayload?.runs,
  });
  switch (action) {
    case "ADD_RUNS":
      return handleRunClick(scoreCard, normalizedPayload);
    case "ADD_WICKET":
      return addWicket(scoreCard, normalizedPayload);
    case "UPDATE_OVERS":
      return updateOvers(scoreCard);
    default:
      scoringWarn("scorecard.mutation.invalid_action", { action });
      return scoreCard;
  }
};

function addWicket(scoreCard, { bowlerName, batsmanName }) {
  const inning = scoreCard?.innings?.[scoreCard.currentInning - 1];
  const batsman = inning?.batsmen?.find((player) => player.name === batsmanName);
  const bowler = inning?.bowlers?.find((b) => b.name === bowlerName);

  if (batsman) batsman.isOut = true;
  if (inning) inning.wickets += 1;
  if (bowler) bowler.wickets += 1;

  return { ...scoreCard };
}

function updateOvers(scoreCard) {
  const inning = scoreCard?.innings?.[scoreCard.currentInning - 1];
  if (!inning) {
    return { ...scoreCard };
  }
  inning.overs = calculateOvers(inning.balls || 0);
  inning.bowlers = (inning.bowlers || []).map((bowler) => ({
    ...bowler,
    overs: calculateOvers(bowler.balls || 0),
  }));
  return { ...scoreCard };
}

const calculateOvers = (balls) => {
  const completedOvers = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return completedOvers + remainingBalls / 10;
};

const updateBowlerStats = (bowler, runs) => {
  bowler.balls += 1;
  bowler.overs = calculateOvers(bowler.balls);
  bowler.runs += runs;
};

const updateInningStats = (inning, runs, extrasType) => {
  inning.runs += runs;
  if (!extrasType || extrasType) inning.balls += 1;
  inning.overs = calculateOvers(inning.balls);
};

const updateBatsmanStats = (batsman, runs) => {
  batsman.runs += runs;
  batsman.balls += 1;
};

const handleExtras = (inning, extras, runs, striker, bowler, rules) => {
  const noBallPenalty = rules?.noBalls ?? 1;
  const widePenalty = rules?.wides ?? 1;

  if (extras.noBall) {
    inning.runs += runs + noBallPenalty;
    inning.extras[0].noBalls += noBallPenalty;
    bowler.runs += noBallPenalty;
    if (extras.byes) {
      inning.extras[0].byes += runs;
    } else if (extras.legByes) {
      inning.extras[0].legByes += runs;
    } else {
      striker.runs += runs;
      bowler.runs += runs;
    }
  } else if (extras.wide) {
    inning.extras[0].wides += runs + widePenalty;
    inning.runs += runs + widePenalty;
    bowler.runs += runs + widePenalty;
  } else if (extras.byes || extras.legByes) {
    inning.runs += runs;
    striker.balls += 1;
    if (extras.legByes) inning.extras[0].legByes += runs;
    else if (extras.byes) inning.extras[0].byes += runs;
    updateInningStats(inning, 0, false);
    bowler.balls += 1;
    bowler.overs = calculateOvers(bowler.balls);
  }
  inning.extras[0].total =
    inning.extras[0].legByes +
    inning.extras[0].noBalls +
    inning.extras[0].byes +
    inning.extras[0].wides;
};

const swapStrikers = (striker, nonStriker) => {
  striker.isNonStriker = !striker.isNonStriker;
  nonStriker.isNonStriker = !nonStriker.isNonStriker;
};

const handleRunClick = (scoreCard, { runs, extras, rules }) => {
  const normalizedExtras = sanitizeExtras(extras);
  const inning = scoreCard.innings[scoreCard.currentInning - 1];
  const striker = inning.batsmen.find(
    (player) => !player.isOut && !player.isNonStriker
  );
  const nonStriker = inning.batsmen.find(
    (player) => !player.isOut && player.isNonStriker
  );
  const bowler = inning.bowlers.find((bowler) => bowler.currentBowler);

  bowler.balls = bowler.balls || 0;
  bowler.overs = bowler.overs || 0;

  if (
    normalizedExtras.noBall ||
    normalizedExtras.wide ||
    normalizedExtras.byes ||
    normalizedExtras.legByes
  ) {
    handleExtras(inning, normalizedExtras, runs, striker, bowler, rules);
  } else {
    updateBatsmanStats(striker, runs);
    updateInningStats(inning, runs);
    updateBowlerStats(bowler, runs);
  }

  if (runs % 2 === 1) {
    swapStrikers(striker, nonStriker);
  }
  const shouldCreditBoundary =
    !normalizedExtras.wide &&
    !normalizedExtras.byes &&
    !normalizedExtras.legByes;
  if (shouldCreditBoundary && runs === 4) {
    striker.fours += 1;
  }
  if (shouldCreditBoundary && runs === 6) {
    striker.sixes += 1;
  }
  if (bowler.balls > 0 && bowler.balls % 6 === 0 && !normalizedExtras.wicket) {
    bowler.currentBowler = false;
    swapStrikers(striker, nonStriker);
  }

  return { ...scoreCard };
};

export {};
