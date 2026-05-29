import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import InboxIcon from "@mui/icons-material/Inbox";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const iconMap = {
  match: SportsCricketIcon,
  search: SearchOffIcon,
  default: InboxIcon,
};

const EmptyState = ({
  title = "Nothing here yet",
  description = "Data will appear once available.",
  icon = "default",
  action,
}) => {
  const IconComponent = iconMap[icon] || iconMap.default;

  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      className="animate-fade-in"
      sx={{ py: { xs: 5, md: 7 }, px: 3, textAlign: "center" }}
    >
      {/* Icon bubble */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)",
          border: "1px solid rgba(108, 99, 255, 0.18)",
          mb: 0.5,
        }}
      >
        <IconComponent sx={{ fontSize: 28, color: "rgba(139, 92, 246, 0.7)" }} />
      </Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: "text.primary", letterSpacing: "-0.01em" }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 320, lineHeight: 1.65 }}
      >
        {description}
      </Typography>

      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Stack>
  );
};

export default EmptyState;
