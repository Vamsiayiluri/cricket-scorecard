/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
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
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NotificationBell from "../components/ui/NotificationBell";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PUBLIC_ROUTE_PREFIXES } from "../services/firebase/constants";
import { getRoleLabel } from "../utils/roles";

const drawerWidth = 260;

const isPublicPath = (pathname) =>
  PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export const CricVeloLogo = ({ size = 36, showText = true }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ cursor: "pointer" }}>
      {/*
        Light mode: mix-blend-mode multiply makes the white PNG background
        invisible against the light AppBar — only the logo artwork shows.
        Dark mode: a tight white pill wraps the image so colors render accurately
        against the dark AppBar without bleed or tinting.
      */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...(isDark
            ? {
                bgcolor: "rgba(255,255,255,0.94)",
                borderRadius: "8px",
                p: "3px",
              }
            : {}),
        }}
      >
        <Box
          component="img"
          src="/cric-velo-logo.png"
          alt="CricVelo"
          sx={{
            height: size,
            width: "auto",
            display: "block",
            objectFit: "contain",
            mixBlendMode: isDark ? "normal" : "multiply",
          }}
        />
      </Box>

      {showText && (
        <Typography
          variant="h3"
          component="span"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1.1rem", md: "1.25rem" },
            letterSpacing: "-0.02em",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          <Box component="span" sx={{ color: "text.primary" }}>CRIC</Box>
          <Box component="span" sx={{ color: "#3AAA35" }}>VELO</Box>
        </Typography>
      )}
    </Stack>
  );
};

const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isScorer, role, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isPublicPage = isPublicPath(location.pathname);
  const isPublicChrome = isPublicPage && !isAuthenticated;

  const userInitial = useMemo(() => {
    const name = user?.displayName || user?.email || "";
    return name.charAt(0).toUpperCase() || "U";
  }, [user]);

  const userName = useMemo(() => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    return "Account";
  }, [user]);

  const navItems = useMemo(() => {
    if (isScorer) {
      return [
        { label: "Dashboard",    path: "/dashboard",    icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: "Create Match", path: "/create-match", icon: <AddCircleOutlinedIcon fontSize="small" /> },
        { label: "Teams",        path: "/teams",        icon: <GroupsOutlinedIcon fontSize="small" /> },
        { label: "Players",      path: "/players",      icon: <PersonOutlinedIcon fontSize="small" /> },
        { label: "Tournaments",  path: "/tournaments",  icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
        { label: "Import Teams",    path: "/imports",          icon: <UploadFileOutlinedIcon fontSize="small" /> },
        { label: "Scorer Requests", path: "/scorer-requests", icon: <HowToRegOutlinedIcon fontSize="small" /> },
        { label: "Settings",        path: "/settings",         icon: <SettingsOutlinedIcon fontSize="small" /> },
      ];
    }
    return [
      { label: "Dashboard",    path: "/dashboard",    icon: <DashboardOutlinedIcon fontSize="small" /> },
      { label: "Live Matches", path: "/discover",     icon: <SportsCricketIcon fontSize="small" /> },
      { label: "Tournaments",  path: "/tournaments",  icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
      { label: "Results",      path: "/results",      icon: <FactCheckOutlinedIcon fontSize="small" /> },
      { label: "Become a Scorer", path: "/become-scorer", icon: <StarBorderOutlinedIcon fontSize="small" /> },
    ];
  }, [isScorer]);

  // Scorer mobile nav — 5 priority items only (full list accessible via hamburger)
  const mobileNavItems = useMemo(() => {
    if (!isScorer) return navItems;
    return navItems.filter((item) =>
      ["/dashboard", "/create-match", "/teams", "/tournaments", "/settings"].includes(item.path)
    );
  }, [isScorer, navItems]);

  const handleLogout = async () => {
    setProfileAnchor(null);
    await logout();
    navigate("/login");
  };

  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const navItemSx = (isSelected, isPrimary = false) => ({
    borderRadius: 1,
    mb: 0.5,
    py: 1.25,
    px: 2,
    transition: "all 200ms ease",
    backgroundColor: isSelected
      ? "rgba(108, 99, 255, 0.12) !important"
      : isPrimary
      ? "rgba(108, 99, 255, 0.08)"
      : "transparent",
    border: isSelected || isPrimary ? "1px solid rgba(108, 99, 255, 0.25)" : "1px solid transparent",
    color: isSelected || isPrimary ? "text.primary" : "text.secondary",
    "& .MuiListItemIcon-root": {
      color: isSelected || isPrimary ? "#6C63FF" : "text.secondary",
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
      "& .MuiListItemIcon-root": { color: "#6C63FF" },
    },
  });

  // Scorer nav index groupings:
  // [0] Dashboard | [1] Create Match | [2-4] Teams/Players/Tournaments | [5-6] Import Teams/Scorer Requests | [7] Settings
  const scorerDividers = isScorer ? new Set([2, 5, 7]) : new Set();

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
        {navItems.map((item, idx) => {
          const isSelected = location.pathname === item.path;
          return (
            <Box key={item.path}>
              {scorerDividers.has(idx) && <Divider sx={{ my: 1, borderColor: "divider" }} />}
              <ListItemButton
                selected={isSelected}
                aria-current={isSelected ? "page" : undefined}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                sx={navItemSx(isSelected, item.isPrimary)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.925rem" }}
                />
              </ListItemButton>
            </Box>
          );
        })}

        {isPublicChrome && (
          <>
            <ListItemButton
              component={RouterLink}
              to="/discover"
              selected={location.pathname === "/discover"}
              sx={{
                borderRadius: 1,
                mb: 0.5,
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
                <SportsCricketIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Live Matches" primaryTypographyProps={{ fontWeight: 600 }} />
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

      {/* Sidebar footer */}
      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider", opacity: 0.6 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
          CricVelo {import.meta.env.VITE_APP_VERSION ? `v${import.meta.env.VITE_APP_VERSION}` : ""}
        </Typography>
      </Box>
    </Box>
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  const showSidebar = isAuthenticated;

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
                aria-label="Open navigation menu"
                sx={{ display: { md: "none" }, mr: 1, color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box onClick={() => navigate(isPublicChrome ? "/" : "/dashboard")} sx={{ cursor: "pointer" }}>
              <CricVeloLogo />
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {isPublicChrome && (
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

            {isAuthenticated && (
              <NotificationBell uid={user?.uid} />
            )}

            {isPublicChrome && (
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
                    {userInitial}
                  </Avatar>
                  <Box sx={{ display: { xs: "none", lg: "block" } }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.825rem", color: "text.primary" }}>
                      {userName}
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
                    <Typography variant="body1" sx={{ fontWeight: 700, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {userName}
                    </Typography>
                    {user?.email && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.2, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.email}
                      </Typography>
                    )}
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
          pt: "68px",
          pb: 8,
          px: { xs: 1.5, sm: 2, md: 3 },
          width: "100%",
          maxWidth: isPublicChrome ? 1040 : "100%",
          mx: isPublicChrome ? "auto" : 0,
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
          <Stack direction="row" sx={{ p: 0.5 }} justifyContent="space-around">
            {mobileNavItems.map((item) => {
              const isSelected = location.pathname === item.path;
              return (
                <Tooltip key={item.path} title={item.label} placement="top">
                  <IconButton
                    onClick={() => navigate(item.path)}
                    aria-label={item.label}
                    aria-current={isSelected ? "page" : undefined}
                    sx={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: 1,
                      color: isSelected ? "primary.main" : "text.secondary",
                      bgcolor: isSelected ? "rgba(108, 99, 255, 0.1)" : "transparent",
                    }}
                  >
                    {item.icon}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default AppShell;
