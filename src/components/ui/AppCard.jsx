import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

const AppCard = ({ title, subtitle, action, children, sx, contentSx, glowColor }) => {
  const glow = glowColor || "rgba(108, 99, 255, 0.05)";

  return (
    <Card
      sx={{
        height: "100%",
        backdropFilter: "blur(8px)",
        position: "relative",
        overflow: "hidden",
        borderRadius: 1, // Will inherit 8px from baseline theme
        transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",

        /* Ambient inner glow at top-left */
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          background: `radial-gradient(ellipse 60% 40% at 0% 0%, ${glow} 0%, transparent 50%)`,
          pointerEvents: "none",
          zIndex: 0,
        },

        /* 1-px gradient border */
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          padding: "1px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 50%, rgba(255,255,255,0.03) 100%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
          zIndex: 0,
        },

        "&:hover": {
          transform: "translateY(-1.5px)",
          boxShadow:
            "0 6px 18px rgba(3, 8, 20, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
          "&::after": {
            background:
              "linear-gradient(135deg, rgba(108, 99, 255, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
          },
        },
        ...sx,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 2 },
          "&:last-child": { pb: { xs: 2, md: 2 } },
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
