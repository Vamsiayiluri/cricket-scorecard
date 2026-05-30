/* eslint-disable react/prop-types */
import { Card, CardContent, Typography, Box } from "@mui/material";

const AppCard = ({ title, subtitle, action, children, sx, contentSx, glowColor }) => {
  const glow = glowColor || "rgba(108, 99, 255, 0.05)";

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 1,
        transition: "box-shadow 150ms ease, border-color 150ms ease",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 96,
          background: `radial-gradient(ellipse 60% 40% at 0% 0%, ${glow} 0%, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        },
        "&:hover": {
          borderColor: "divider",
        },
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 2.25 },
          "&:last-child": { pb: { xs: 2, md: 2.25 } },
          position: "relative",
          zIndex: 1,
          ...contentSx,
        }}
      >
        {(title || subtitle || action) && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              gap: 2,
            }}
          >
            <Box>
              {title && (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5, lineHeight: 1.4 }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
          </Box>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default AppCard;
