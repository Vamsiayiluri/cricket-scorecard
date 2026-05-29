const inningKey = (inningIndex) => `inning${inningIndex + 1}`;
const overKey = (overIndex) => `over${overIndex + 1}`;

const toArray = (value) => (Array.isArray(value) ? value.filter((item) => item !== undefined) : []);

const normalizeRecentByInnings = (source) => {
  if (!Array.isArray(source)) {
    return { ...(source || {}) };
  }

  return source.reduce((acc, balls, index) => {
    acc[inningKey(index)] = toArray(balls);
    return acc;
  }, {});
};

const normalizeOverHistoryByInnings = (source) => {
  if (!Array.isArray(source)) {
    return Object.entries(source || {}).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        const inningOvers = {};
        value.forEach((balls, overIndex) => {
          inningOvers[overKey(overIndex)] = toArray(balls);
        });
        acc[key] = inningOvers;
      } else {
        acc[key] = { ...(value || {}) };
      }
      return acc;
    }, {});
  }

  return source.reduce((acc, overs, inningIndex) => {
    const inningOvers = {};
    toArray(overs).forEach((balls, overIndex) => {
      inningOvers[overKey(overIndex)] = toArray(balls);
    });
    acc[inningKey(inningIndex)] = inningOvers;
    return acc;
  }, {});
};

export const normalizeScoreCardTimelineStorage = (scoreCard) => {
  if (!scoreCard) {
    return scoreCard;
  }
  if (
    !Object.prototype.hasOwnProperty.call(scoreCard, "recentBallsByInnings") &&
    !Object.prototype.hasOwnProperty.call(scoreCard, "overHistoryByInnings")
  ) {
    return scoreCard;
  }

  return {
    ...scoreCard,
    recentBallsByInnings: normalizeRecentByInnings(scoreCard.recentBallsByInnings),
    overHistoryByInnings: normalizeOverHistoryByInnings(scoreCard.overHistoryByInnings),
  };
};

export const getRecentBallsForInning = (scoreCard, inningIndex) => {
  const source = scoreCard?.recentBallsByInnings;
  if (Array.isArray(source)) {
    return toArray(source[inningIndex]);
  }
  return toArray(source?.[inningKey(inningIndex)]);
};

export const getOverHistoryForInning = (scoreCard, inningIndex) => {
  const source = scoreCard?.overHistoryByInnings;
  if (Array.isArray(source)) {
    return toArray(source[inningIndex]).map(toArray);
  }
  const inningOvers = source?.[inningKey(inningIndex)];
  if (!inningOvers || Array.isArray(inningOvers)) {
    return [];
  }

  return Object.keys(inningOvers)
    .sort((a, b) => Number(a.replace("over", "")) - Number(b.replace("over", "")))
    .map((key) => toArray(inningOvers[key]));
};

export const setTimelineForInning = (scoreCard, inningIndex, recentBalls, overHistory) => {
  const recentByInnings = {
    ...normalizeRecentByInnings(scoreCard?.recentBallsByInnings),
    [inningKey(inningIndex)]: toArray(recentBalls),
  };

  const inningOvers = {};
  toArray(overHistory).forEach((balls, index) => {
    inningOvers[overKey(index)] = toArray(balls);
  });

  return {
    ...normalizeScoreCardTimelineStorage(scoreCard),
    recentBallsByInnings: recentByInnings,
    overHistoryByInnings: {
      ...normalizeOverHistoryByInnings(scoreCard?.overHistoryByInnings),
      [inningKey(inningIndex)]: inningOvers,
    },
  };
};
