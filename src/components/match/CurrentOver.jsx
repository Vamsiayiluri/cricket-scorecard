/* eslint-disable react/prop-types */
import { Typography, Box, Chip, Stack } from "@mui/material";

const isFreeHitBall = (ball) => typeof ball === "string" && ball.includes("fh");

function CurrentOver({ currentOver }) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
        This Over
      </Typography>
      {currentOver?.length ? (
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          role="list"
          aria-label="Current over deliveries"
        >
          {currentOver?.map((ball, index) => {
            const fh = isFreeHitBall(ball);
            const isLatest = index === currentOver.length - 1;
            return (
              <Chip
                key={index}
                role="listitem"
                size="small"
                label={ball}
                color={isLatest ? "primary" : "default"}
                variant={ball?.includes("W") ? "filled" : "outlined"}
                sx={{
                  fontWeight: 700,
                  height: 24,
                  fontSize: "0.72rem",
                  borderRadius: 1,
                  ...(fh && !isLatest && {
                    borderColor: "#F59E0B",
                    color: "#D97706",
                  }),
                  ...(fh && isLatest && {
                    bgcolor: "#F59E0B",
                    color: "#fff",
                    borderColor: "#F59E0B",
                  }),
                }}
              />
            );
          })}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.secondary">
          No deliveries in this over yet.
        </Typography>
      )}
    </Box>
  );
}

export default CurrentOver;
