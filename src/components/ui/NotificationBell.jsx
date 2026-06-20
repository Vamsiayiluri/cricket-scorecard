/* eslint-disable react/prop-types */
import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import useNotifications from "../../hooks/firebase/useNotifications";

const NotificationBell = ({ uid }) => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(uid);

  return (
    <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}>
      <IconButton
        color="inherit"
        onClick={() => navigate("/notifications")}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          p: 1,
          borderRadius: 1,
          display: { xs: "none", sm: "flex" },
        }}
      >
        <Badge
          badgeContent={unreadCount || null}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.6rem",
              minWidth: 16,
              height: 16,
              padding: "0 4px",
            },
          }}
        >
          {unreadCount > 0 ? (
            <NotificationsIcon sx={{ fontSize: 20, color: "warning.main" }} />
          ) : (
            <NotificationsNoneIcon sx={{ fontSize: 20 }} />
          )}
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default NotificationBell;
