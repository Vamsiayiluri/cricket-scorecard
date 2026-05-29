/* eslint-disable react/prop-types */
import { memo } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";

const renderBallChip = (ball, isLatest, key) => (
  <Chip
    key={key}
    role="listitem"
    size="small"
    label={ball}
    color={isLatest ? "primary" : "default"}
    variant={ball?.includes("W") ? "filled" : "outlined"}
    sx={{ fontWeight: 700, height: 20, fontSize: "0.7rem", borderRadius: 1 }}
  />
);

const BallTimeline = memo(({ recentBalls = [], overHistory = [], title = "Recent Balls" }) => {
  if (!recentBalls.length && !overHistory.length) {
    return null;
  }

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
      {recentBalls.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap role="list" aria-label={title}>
            {recentBalls.map((ball, index) =>
              renderBallChip(ball, index === recentBalls.length - 1, `recent-${index}`)
            )}
        </Stack>
      ) : null}
      {overHistory.length ? (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Over History
          </Typography>
          <Stack spacing={0.75} sx={{ mt: 0.5 }}>
            {overHistory.slice(-5).map((overBalls, index) => (
              <Stack key={`over-${index}`} direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap role="list">
                <Typography variant="caption" color="text.secondary">{`Over ${overHistory.length - (overHistory.slice(-5).length - 1 - index)}`}</Typography>
                {overBalls.map((ball, ballIndex) => renderBallChip(ball, false, `over-${index}-${ballIndex}`))}
              </Stack>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
});

BallTimeline.displayName = "BallTimeline";

export default BallTimeline;

