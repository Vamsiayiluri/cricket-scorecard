/* eslint-disable react/prop-types */
import { Box, Stack, Typography } from "@mui/material";

const FallOfWickets = ({ fallOfWickets = [] }) => {
  if (!Array.isArray(fallOfWickets) || fallOfWickets.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
        Fall of Wickets
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {fallOfWickets.map((entry, index) => (
          <Box
            key={`${entry.wicket}-${entry.score}-${entry.batter}-${index}`}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.025)"
                  : "rgba(15,23,42,0.025)",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {entry.wicket}-{entry.score}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({entry.batter}, {entry.over})
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default FallOfWickets;
