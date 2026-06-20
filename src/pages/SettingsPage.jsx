/* eslint-disable react/prop-types */
import { Box, Chip, Divider, Paper, Stack, Switch, Typography } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import PageContainer from "../components/ui/PageContainer";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeModeContext";
import { getRoleLabel } from "../utils/roles";

const Section = ({ title, icon, children }) => (
  <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
    <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2.5, py: 1.5, bgcolor: "action.hover" }}>
      {icon}
      <Typography variant="subtitle2" fontWeight={800}>{title}</Typography>
    </Stack>
    <Divider />
    <Box sx={{ px: 2.5, py: 2 }}>{children}</Box>
  </Paper>
);

const InfoRow = ({ label, value }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
    <Typography variant="body2" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={600}>{value || "—"}</Typography>
  </Stack>
);

const SettingsPage = () => {
  const { user, profile } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const role = profile?.role || "viewer";
  const emailVerified = user?.emailVerified ?? false;

  return (
    <PageContainer title="Settings" subtitle="Manage your account and preferences.">
      <Stack spacing={2.5}>

        {/* Profile */}
        <Section title="Profile" icon={<PersonOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />}>
          <InfoRow label="Display name" value={user?.displayName || user?.email?.split("@")[0]} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow
            label="Email verified"
            value={
              emailVerified
                ? <Chip label="Verified" size="small" color="success" sx={{ height: 20, fontSize: "0.7rem" }} />
                : <Chip label="Not verified" size="small" color="warning" sx={{ height: 20, fontSize: "0.7rem" }} />
            }
          />
        </Section>

        {/* Account */}
        <Section title="Account" icon={<SecurityOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />}>
          <InfoRow label="Role" value={
            <Chip
              label={getRoleLabel(role)}
              size="small"
              sx={{ height: 20, fontSize: "0.7rem", bgcolor: "rgba(108,99,255,0.12)", color: "primary.main", fontWeight: 700 }}
            />
          } />
          <InfoRow label="User ID" value={
            <Typography variant="caption" sx={{ fontFamily: "monospace", color: "text.secondary", fontSize: "0.7rem" }}>
              {user?.uid}
            </Typography>
          } />
          <InfoRow label="Member since" value={
            user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
              : "—"
          } />
        </Section>

        {/* Theme */}
        <Section title="Appearance" icon={<PaletteOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              {mode === "dark"
                ? <DarkModeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                : <LightModeIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              }
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {mode === "dark" ? "Dark mode" : "Light mode"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Toggle between light and dark theme
                </Typography>
              </Box>
            </Stack>
            <Switch
              checked={mode === "dark"}
              onChange={toggleMode}
              color="primary"
              inputProps={{ "aria-label": "Toggle theme" }}
            />
          </Stack>
        </Section>

      </Stack>
    </PageContainer>
  );
};

export default SettingsPage;
