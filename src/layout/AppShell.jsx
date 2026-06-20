/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Divider,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import NotificationBell from "../components/ui/NotificationBell";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useThemeMode } from "../context/ThemeModeContext";
import { useAuth } from "../context/AuthContext";
import { PUBLIC_ROUTE_PREFIXES } from "../services/firebase/constants";
import { getRoleLabel } from "../utils/roles";

const drawerWidth = 260;

const isPublicPath = (pathname) =>
  PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

// Premium Abstract Sports Logo
export const CricVeloLogo = ({ size = 28, showText = true }) => (
  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ cursor: "pointer" }}>
    <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Speed motion arcs */}
        <circle cx="16" cy="16" r="13" stroke="url(#ball-grad)" strokeWidth="2.2" strokeDasharray="5 3" />
        <path d="M4 16C4 9.37258 9.37258 4 16 4" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" />
        <circle cx="16" cy="16" r="7.5" fill="url(#ball-inner)" />
        <path d="M13 16C13 14.3431 14.3431 13 16 13" stroke="#F8FAFC" strokeWidth="1.2" strokeLinecap="round" />
        <defs>
          <linearGradient id="ball-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6C63FF" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="ball-inner" x1="9" y1="9" x2="23" y2="23" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#6C63FF" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
    {showText && (
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.1rem", md: "1.3rem" },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #F8FAFC 30%, #94A3B8 100%)"
              : "linear-gradient(135deg, #0f172a 30%, #475569 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em",
          display: "flex",
          alignItems: "center",
          gap: "2px",
        }}
      >
        CRIC<span style={{ color: "#8B5CF6" }}>VELO</span>
      </Typography>
    )}
  </Stack>
);

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeMode();
  const { isAuthenticated, isScorer, role, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isPublicPage = isPublicPath(location.pathname);

  const navItems = useMemo(() => {
    const items = [
      {
        label: "Dashboard",
        path: "/dashboard",
        requiresAuth: true,
        icon: <DashboardOutlinedIcon fontSize="small" />,
      },
      {
        label: "Discover",
        path: "/discover",
        requiresAuth: true,
        icon: <ExploreOutlinedIcon fontSize="small" />,
      },
      {
        label: "Notifications",
        path: "/notifications",
        requiresAuth: true,
        icon: <NotificationsNoneIcon fontSize="small" />,
      },
    ];
    if (isScorer) {
      items.push({
        label: "Create Match",
        path: "/create-match",
        requiresAuth: true,
        icon: <AddCircleOutlineOutlinedIcon fontSize="small" />,
      });
      items.push({
        label: "Tournaments",
        path: "/tournaments",
        requiresAuth: true,
        icon: <EmojiEventsOutlinedIcon fontSize="small" />,
      });
      items.push({
        label: "My Teams",
        path: "/teams",
        requiresAuth: true,
        icon: <GroupsOutlinedIcon fontSize="small" />,
      });
      items.push({
        label: "My Players",
        path: "/players",
        requiresAuth: true,
        icon: <PersonOutlinedIcon fontSize="small" />,
      });
      items.push({
        label: "AA Import",
        path: "/imports",
        requiresAuth: true,
        icon: <UploadFileOutlinedIcon fontSize="small" />,
      });
      items.push({
        label: "Import History",
        path: "/import-history",
        requiresAuth: true,
        icon: <HistoryOutlinedIcon fontSize="small" />,
      });
    }
    return items;
  }, [isScorer]);

  const handleLogout = async () => {
    setProfileAnchor(null);
    await logout();
    navigate("/login");
  };

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 2,
        pt: 2.5,
        bgcolor: "background.paper",
      }}
    >
      <List sx={{ p: 0, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={isSelected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 1,
                mb: 1,
                py: 1.25,
                px: 2,
                transition: "all 200ms ease",
                backgroundColor: isSelected ? "rgba(108, 99, 255, 0.12) !important" : "transparent",
                border: isSelected ? "1px solid rgba(108, 99, 255, 0.25)" : "1px solid transparent",
                color: isSelected ? "text.primary" : "text.secondary",
                "& .MuiListItemIcon-root": {
                  color: isSelected ? "#6C63FF" : "text.secondary",
                  minWidth: 36,
                },
                "&:hover": {
                  backgroundColor: (theme) =>
                    isSelected
                      ? "rgba(108, 99, 255, 0.16)"
                      : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(15, 23, 42, 0.04)",
                  color: "text.primary",
                  "& .MuiListItemIcon-root": {
                    color: "#6C63FF",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.925rem" }}
              />
            </ListItemButton>
          );
        })}
        {isPublicPage && (
          <>
            <ListItemButton
              component={RouterLink}
              to="/discover"
              selected={location.pathname === "/discover"}
              sx={{
                borderRadius: 1,
                mb: 1,
                py: 1.25,
                px: 2,
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(15, 23, 42, 0.04)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(108, 99, 255, 0.12) !important",
                  border: "1px solid rgba(108, 99, 255, 0.25)",
                  color: "text.primary",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                <ExploreOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Discover" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
            <ListItemButton
              component={RouterLink}
              to="/login"
              sx={{
                borderRadius: 1,
                py: 1.25,
                px: 2,
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(15, 23, 42, 0.04)",
                },
              }}
            >
              <ListItemText primary="Sign In" primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          </>
        )}
      </List>

      {/* Footer Details */}
      <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid", borderColor: "divider", opacity: 0.8 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
          CricVelo Match Center v1.2
        </Typography>
      </Box>
    </Box>
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  const showSidebar = isAuthenticated && !isPublicPage;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(16px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(7, 17, 32, 0.75)" : "rgba(255,255,255,0.8)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 1.5, md: 3 }, minHeight: 68 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {showSidebar && (
              <IconButton
                edge="start"
                onClick={() => setMobileOpen(true)}
                sx={{ display: { md: "none" }, mr: 1, color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box onClick={() => navigate(isPublicPage ? "/" : "/dashboard")} sx={{ cursor: "pointer" }}>
              <CricVeloLogo />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Live Indicator inside top nav */}
            {isPublicPage && (
              <Chip
                label="Live Match Center"
                size="small"
                sx={{
                  bgcolor: "rgba(34, 197, 94, 0.15)",
                  color: "#22C55E",
                  borderColor: "rgba(34, 197, 94, 0.3)",
                  border: "1px solid",
                  fontWeight: 700,
                }}
              />
            )}

            <IconButton onClick={toggleMode} color="inherit" sx={{ border: "1px solid", borderColor: "divider", p: 1, borderRadius: 1 }}>
              {mode === "dark" ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
            </IconButton>

            {isAuthenticated && (
              <NotificationBell uid={user?.uid} />
            )}

            {isPublicPage && !isAuthenticated && (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="small"
                sx={{ borderRadius: 1, px: 2.5 }}
              >
                Sign In
              </Button>
            )}

            {isAuthenticated && (
              <>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  onClick={handleProfileOpen}
                  sx={{
                    cursor: "pointer",
                    p: 0.5,
                    pr: 1.2,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.03)"
                          : "rgba(15, 23, 42, 0.04)",
                    },
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "primary.main",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                    }}
                  >
                    U
                  </Avatar>
                  <Box sx={{ display: { xs: "none", lg: "block" } }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.825rem", color: "text.primary" }}>
                      User Account
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: -0.3 }}>
                      {getRoleLabel(role)}
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                </Stack>

                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileClose}
                  onClick={handleProfileClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: 220,
                      p: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      Operational Panel
                    </Typography>
                    <Chip
                      size="small"
                      label={getRoleLabel(role)}
                      sx={{ mt: 0.75, bgcolor: "rgba(108, 99, 255, 0.15)", color: "#6C63FF" }}
                    />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={() => navigate("/dashboard")}>
                    <ListItemIcon>
                      <DashboardOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => { handleProfileClose(); navigate("/settings"); }}>
                    <ListItemIcon>
                      <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    Settings
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      {showSidebar && (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                bgcolor: "background.paper",
                backgroundImage: "none",
                borderRight: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                boxSizing: "border-box",
                borderRight: "1px solid",
                borderColor: "divider",
                position: "fixed",
                top: 68,
                height: "calc(100vh - 68px)",
                borderRadius: 0,
                bgcolor: "background.paper",
                backgroundImage: "none",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "inset 0 1px 0 0 rgba(255, 255, 255, 0.04)"
                    : "inset 0 1px 0 0 rgba(15, 23, 42, 0.04)",
                overflowY: "auto",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>
      )}

      <Box
        component="main"
        className="animate-fade-in"
        sx={{
          flexGrow: 1,
          pt: "92px",
          pb: 8,
          px: { xs: 1.5, sm: 2, md: 3 },
          width: "100%",
          maxWidth: isPublicPage ? 1040 : "100%",
          mx: isPublicPage ? "auto" : 0,
        }}
      >
        {children}
      </Box>

      {showSidebar && (
        <Box
          component="nav"
          sx={{
            position: "fixed",
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: (theme) => theme.zIndex.appBar,
            display: { xs: "block", md: "none" },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 14px 30px -20px rgba(0, 0, 0, 0.8)"
                : "0 14px 30px -22px rgba(15, 23, 42, 0.28)",
            overflow: "hidden",
          }}
        >
          <Stack direction="row" sx={{ p: 0.5 }}>
            {navItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  sx={{
                    flex: 1,
                    minHeight: 46,
                    borderRadius: 1,
                    color: isSelected ? "primary.main" : "text.secondary",
                    bgcolor: isSelected ? "rgba(108, 99, 255, 0.1)" : "transparent",
                    fontWeight: 800,
                    fontSize: "0.78rem",
                    "& .MuiButton-startIcon": { mr: 0.5 },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default AppShell;
