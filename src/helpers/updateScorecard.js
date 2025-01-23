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
  switch (action) {
    case "ADD_RUNS":
      return handleRunClick(scoreCard, payload);
    case "ADD_WICKET":
      return addWicket(scoreCard, payload);
    case "UPDATE_OVERS":
      return updateOvers(scoreCard, payload);
    default:
      console.error("Invalid action");
      return scoreCard;
  }
};

function addWicket(scoreCard, { bowlerName, batsmanName }) {
  const inning = scoreCard.innings[scoreCard.currentInning - 1];
  const batsman = inning.batsmen.find((player) => player.name === batsmanName);

  batsman.isOut = true;
  inning.wickets += 1;

  const bowler = scoreCard.bowlers.find((b) => b.name === bowlerName);
  bowler.wickets += 1;

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
  if (extras.noBall) {
    inning.runs += runs + rules.noBalls;
    bowler.runs += rules.noBalls;
    striker.balls += 1;
    inning.extras[0].noBalls += runs + rules.noBalls;
    if (!extras.byes && !extras.legByes) {
      striker.runs += runs;
      bowler.runs += runs;
    }
  } else if (extras.wide) {
    inning.extras[0].wides += runs + rules.wides;
    inning.runs += runs + rules.wides;
    bowler.runs += runs + rules.wides;
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

  if (extras.noBall || extras.wide || extras.byes || extras.legByes) {
    handleExtras(inning, extras, runs, striker, bowler, rules);
  } else {
    updateBatsmanStats(striker, runs);
    updateInningStats(inning, runs);
    updateBowlerStats(bowler, runs);
  }

  if (runs % 2 === 1) {
    swapStrikers(striker, nonStriker);
  }
  if (runs === 4) {
    striker.fours += 1;
  }
  if (runs === 6) {
    striker.sixes += 1;
  }
  if (bowler.balls === 6 && !extras.wicket) {
    bowler.currentBowler = false;
    swapStrikers(striker, nonStriker);
  }

  return { ...scoreCard };
};

export {};
