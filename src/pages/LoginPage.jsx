import { useState } from "react";
import {
  Box,
  Typography,
  Link as MuiLink,
  Stack,
  Chip,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AppInput from "../components/ui/AppInput";
import AppButton from "../components/ui/AppButton";
import { useToast } from "../context/ToastContext";
import { CricVeloLogo } from "../layout/AppShell";
import {
  loginWithEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../services/firebase/authService";

const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const redirectTo = location.state?.from || "/dashboard";

  const handleLogin = async () => {
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setIsLoggingIn(true);
    try {
      const userCredential = await loginWithEmail(email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        showToast("Login successful", "success");
        navigate(redirectTo, { replace: true });
      } else {
        const actionCodeSettings = {
          url: `${window.location.origin}/dashboard`,
          handleCodeInApp: true,
        };
        await sendVerificationEmail(user, actionCodeSettings);
        setError("Please verify your email before logging in. Verification email sent.");
        showToast("Verification email sent", "info");
      }
    } catch {
      setError("Invalid email or password.");
      showToast("Invalid email or password", "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openResetDialog = () => {
    setResetEmail(email);
    setResetError("");
    setIsResetOpen(true);
  };

  const handlePasswordReset = async () => {
    setResetError("");
    if (!isValidEmail(resetEmail)) {
      setResetError("Enter the email address for your account.");
      return;
    }
    setIsSendingReset(true);
    try {
      await sendResetPasswordEmail(resetEmail, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false,
      });
      showToast("Password reset email sent", "success");
      setIsResetOpen(false);
    } catch {
      setResetError("Unable to send reset email. Check the address and try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
      {/* LEFT SIDE PANEL (Visual branding mesh, 60% on desktop) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "52%",
          p: { md: 5, lg: 6 },
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #08111f 0%, #0d1b2e 58%, #101827 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <CricVeloLogo size={36} />
        </Box>

        <Box sx={{ position: "relative", zIndex: 2, my: "auto", maxWidth: 540 }}>
          <Chip
            size="small"
            label="NEXT-GEN LIVE SCORING"
            sx={{
              bgcolor: "rgba(108, 99, 255, 0.15)",
              color: "#8b84ff",
              border: "1px solid rgba(108,99,255,0.3)",
              fontWeight: 700,
              mb: 2.5,
              px: 1,
            }}
          />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              color: "#F8FAFC",
              fontSize: { md: "2.35rem", lg: "3rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              mb: 2.5,
            }}
          >
            Live cricket scoring <br />
            built for fast match-day operations
          </Typography>
          <Typography variant="body1" sx={{ color: "#94A3B8", fontSize: "1.1rem", lineHeight: 1.6, mb: 4 }}>
            Score ball-by-ball, stream live to global audiences, and manage team roster details inside a responsive, sports-tech SaaS platform.
          </Typography>

          <Stack spacing={2}>
            {[
              "Real-time ball-by-ball score sync with Cloud Firestore",
              "Full scorer operational console with safety corrections",
              "Shareable public scorecards and live match fan tickers",
            ].map((text, i) => (
              <Stack direction="row" spacing={1.5} alignItems="center" key={i}>
                <CheckCircleOutlineIcon sx={{ color: "#22C55E", fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: "#E2E8F0", fontWeight: 600 }}>
                  {text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Branding Footer */}
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Designed for professional leagues, clubs, and sports broadcasters.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE PANEL (Authentication Form, 40% on desktop) */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          background: "background.default",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            p: { xs: 0, sm: 3 },
            borderRadius: { xs: 0, sm: 2 },
            bgcolor: { xs: "transparent", sm: "background.paper" },
            border: { xs: "none", sm: "1px solid" },
            borderColor: "divider",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 18px 40px -30px rgba(0,0,0,0.8)"
                : "0 18px 40px -32px rgba(15,23,42,0.35)",
            animation: "slide-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Logo on mobile only */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4, textAlign: "center" }}>
            <CricVeloLogo size={32} />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, color: "text.primary", mb: 1 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to manage score sheets and teams.
            </Typography>
          </Box>

          {error && (
            <Box
              role="alert"
              sx={{
                p: 1.5,
                mb: 2.5,
                borderRadius: 1,
                bgcolor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              <Typography variant="body2" color="#EF4444" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Box>
          )}

          <Stack spacing={2} sx={{ mb: 2.5 }}>
            <AppInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              error={Boolean(error) && !isValidEmail(email)}
            />
            <AppInput
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                      aria-label="Toggle password visibility"
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                  sx={{ color: "text.secondary" }}
                />
              }
              label={
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Remember device
                </Typography>
              }
            />
            <MuiLink
              component="button"
              type="button"
              onClick={openResetDialog}
              variant="body2"
              sx={{
                color: "#8b84ff",
                fontWeight: 600,
                border: 0,
                bgcolor: "transparent",
                cursor: "pointer",
                p: 0,
                "&:hover": { color: "#6C63FF" },
              }}
            >
              Forgot password?
            </MuiLink>
          </Stack>

          <AppButton fullWidth onClick={handleLogin} loading={isLoggingIn} sx={{ mb: 2.5 }}>
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </AppButton>

          <Divider sx={{ my: 3.5, borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Or continue with
            </Typography>
          </Divider>

          <GoogleLoginButton redirectTo={redirectTo} />

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
            Don&apos;t have a manager account?{" "}
            <MuiLink
              component={Link}
              to="/register"
              sx={{ color: "#8b84ff", fontWeight: 700, "&:hover": { color: "#6C63FF" } }}
            >
              Sign up free
            </MuiLink>
          </Typography>
        </Box>
      </Box>
      <Dialog open={isResetOpen} onClose={() => !isSendingReset && setIsResetOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your account email and CricVelo will send a password reset link.
          </Typography>
          <AppInput
            label="Account email"
            type="email"
            value={resetEmail}
            onChange={(event) => setResetEmail(event.target.value)}
            fullWidth
            autoComplete="email"
            error={Boolean(resetError)}
            helperText={resetError}
          />
        </DialogContent>
        <DialogActions>
          <AppButton variant="text" onClick={() => setIsResetOpen(false)} disabled={isSendingReset}>
            Cancel
          </AppButton>
          <AppButton onClick={handlePasswordReset} loading={isSendingReset}>
            {isSendingReset ? "Sending..." : "Send reset link"}
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
