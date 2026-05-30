/* eslint-disable react/prop-types */
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
      sx={{ py: { xs: 4, md: 5 }, px: 2.5, textAlign: "center" }}
    >
      {/* Icon bubble */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(108, 99, 255, 0.08)",
          border: "1px solid rgba(108, 99, 255, 0.18)",
          mb: 0.5,
        }}
      >
        <IconComponent sx={{ fontSize: 26, color: "primary.main" }} />
      </Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: "text.primary" }}
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
