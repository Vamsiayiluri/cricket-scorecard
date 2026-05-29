import React, { useState } from "react";
import {
  Box,
  Typography,
  Link as MuiLink,
  Stack,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Link } from "react-router-dom";
import AppInput from "../components/ui/AppInput";
import AppButton from "../components/ui/AppButton";
import { useToast } from "../context/ToastContext";
import { CricVeloLogo } from "../layout/AppShell";
import { registerWithEmail, sendVerificationEmail } from "../services/firebase/authService";
import { createUserProfile } from "../services/firebase/userService";
import { USER_ROLES } from "../services/firebase/constants";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      showToast("Passwords do not match", "error");
      return;
    }
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/dashboard`,
        handleCodeInApp: true,
      };
      const userCredential = await registerWithEmail(email, password);
      const user = userCredential.user;

      await createUserProfile(user, USER_ROLES.VIEWER);
      await sendVerificationEmail(user, actionCodeSettings);

      setSuccess("Account created! Check your inbox to verify your email, then sign in as a viewer.");
      showToast("Viewer account created", "success");
    } catch (err) {
      setError(err.message);
      showToast("Unable to register. Please try again.", "error");
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", overflow: "hidden", bgcolor: "#071120" }}>
      {/* LEFT SIDE PANEL (Visual branding mesh) */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "55%",
          p: 6,
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #071120 0%, #111a3b 60%, #0c2d3a 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)",
            top: "-50px",
            left: "-50px",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)",
            bottom: "-100px",
            right: "-100px",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <CricVeloLogo size={36} />
        </Box>

        <Box sx={{ position: "relative", zIndex: 2, my: "auto", maxWidth: 540 }}>
          <Chip
            size="small"
            label="JOIN THE COMMUNITY"
            sx={{
              bgcolor: "rgba(34, 197, 94, 0.15)",
              color: "#4ade80",
              border: "1px solid rgba(34, 197, 94, 0.3)",
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
              fontSize: { md: "2.5rem", lg: "3.2rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              mb: 2.5,
            }}
          >
            Follow every over <br />
            with modern match analytics
          </Typography>
          <Typography variant="body1" sx={{ color: "#94A3B8", fontSize: "1.1rem", lineHeight: 1.6, mb: 4 }}>
            Create your account to browse real-time dashboards, unlock custom match center access, and follow your team's live scoring stream.
          </Typography>

          <Stack spacing={2}>
            {[
              "Mobile-first responsive live game scorecards",
              "Public match-sharing links for fans and teammates",
              "Premium statistics, wagon wheels, and run-rate graphs",
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

        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Create a viewer account to start. Match setup controls are allocated to registered scorers.
          </Typography>
        </Box>
      </Box>

      {/* RIGHT SIDE PANEL (Register Form) */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          background: "radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.3) 0%, #071120 100%)",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            animation: "slide-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Logo on mobile only */}
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4, textAlign: "center" }}>
            <CricVeloLogo size={32} />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, color: "#F8FAFC", mb: 1, letterSpacing: "-0.02em" }}>
              Get Started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create a free viewer account to follow live scores.
            </Typography>
          </Box>

          {error && (
            <Box
              sx={{
                p: 1.5,
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
              }}
            >
              <Typography variant="body2" color="#EF4444" sx={{ fontWeight: 600 }}>
                {error}
              </Typography>
            </Box>
          )}

          {success && (
            <Box
              sx={{
                p: 1.5,
                mb: 2.5,
                borderRadius: 2.5,
                bgcolor: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
              }}
            >
              <Typography variant="body2" color="#22C55E" sx={{ fontWeight: 600 }}>
                {success}
              </Typography>
            </Box>
          )}

          <Stack spacing={2} sx={{ mb: 3.5 }}>
            <AppInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <AppInput
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <AppInput
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      edge="end"
                      aria-label="Toggle confirm password visibility"
                      sx={{ color: "text.secondary" }}
                    >
                      {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <AppButton fullWidth onClick={handleRegister} sx={{ mb: 3 }}>
            Create Account
          </AppButton>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Already have a viewer profile?{" "}
            <MuiLink
              component={Link}
              to="/login"
              sx={{ color: "#8b84ff", fontWeight: 700, "&:hover": { color: "#6C63FF" } }}
            >
              Sign In
            </MuiLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
