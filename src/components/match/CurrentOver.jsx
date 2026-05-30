/* eslint-disable react/prop-types */
import { Typography, Box, Chip, Stack } from "@mui/material";

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
          {currentOver?.map((ball, index) => (
            <Chip
              key={index}
              role="listitem"
              size="small"
              label={ball}
              color={index === currentOver.length - 1 ? "primary" : "default"}
              variant={ball?.includes("W") ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                height: 24,
                fontSize: "0.72rem",
                borderRadius: 1,
              }}
            />
          ))}
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
