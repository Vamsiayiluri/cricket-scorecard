import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode = "dark") =>
  createTheme({
  palette: {
    mode,
    primary: {
      main: "#6C63FF",
      dark: "#5b53e6",
      light: "#8b84ff",
      contrastText: "#F8FAFC",
    },
    secondary: {
      main: "#8B5CF6",
      dark: "#7c3aed",
      light: "#a78bfa",
      contrastText: "#F8FAFC",
    },
    success: {
      main: "#22C55E",
      dark: "#16a34a",
      light: "#4ade80",
    },
    warning: {
      main: "#F59E0B",
      dark: "#d97706",
      light: "#fbbf24",
    },
    error: {
      main: "#EF4444",
      dark: "#dc2626",
      light: "#f87171",
    },
    info: {
      main: "#38BDF8",
      dark: "#0284c7",
      light: "#7dd3fc",
    },
    background: {
      default: mode === "dark" ? "#071120" : "#f4f6fc",
      paper: mode === "dark" ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.88)",
    },
    text: {
      primary: mode === "dark" ? "#F8FAFC" : "#0f172a",
      secondary: mode === "dark" ? "#94A3B8" : "#64748b",
    },
    divider: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)",
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', 'Roboto', 'Helvetica', sans-serif",
    h1: { fontSize: "2.0rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em" },
    h2: { fontSize: "1.55rem", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.02em" },
    h3: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" },
    h4: { fontSize: "1.12rem", fontWeight: 700, lineHeight: 1.3 },
    subtitle1: { fontSize: "0.925rem", fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "0.9rem", lineHeight: 1.5 },
    body2: { fontSize: "0.825rem", lineHeight: 1.45 },
    caption: { fontSize: "0.725rem", fontWeight: 500, letterSpacing: "0.01em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            mode === "dark"
              ? "radial-gradient(circle at 10% 20%, rgba(108, 99, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 40%), #071120"
              : "radial-gradient(circle at 5% 15%, rgba(108,99,255,0.03) 0%, transparent 35%), radial-gradient(circle at 90% 12%, rgba(139,92,246,0.02) 0%, transparent 30%), #f4f6fc",
          color: mode === "dark" ? "#F8FAFC" : "#0f172a",
          minHeight: "100vh",
          transition: "background-color 0.2s ease, color 0.2s ease",
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 700,
          minHeight: 38,
          padding: "8px 16px",
          transition: "transform 150ms ease, box-shadow 150ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: mode === "dark" ? "0 4px 12px rgba(108, 99, 255, 0.15)" : "0 4px 12px rgba(108, 99, 255, 0.08)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)",
          color: "#F8FAFC",
          "&:hover": {
            background: "linear-gradient(135deg, #5b53e6 0%, #7c3aed 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: mode === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.95)",
          border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(15, 23, 42, 0.04)",
          boxShadow:
            mode === "dark"
              ? "0 4px 20px -8px rgba(3, 8, 20, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)"
              : "0 4px 16px -8px rgba(99, 102, 241, 0.05)",
          backdropFilter: "blur(8px)",
          transition: "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
          "&:hover": {
            transform: "translateY(-1px)",
            borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.08)",
            boxShadow:
              mode === "dark"
                ? "0 8px 24px -8px rgba(3, 8, 20, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)"
                : "0 6px 20px -8px rgba(99, 102, 241, 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
          backgroundColor: mode === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.95)",
          border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(15, 23, 42, 0.04)",
          backdropFilter: "blur(8px)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        fullWidth: true,
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
            backgroundColor: mode === "dark" ? "rgba(15, 23, 42, 0.45)" : "rgba(255, 255, 255, 0.8)",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            "& fieldset": {
              borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.08)",
            },
            "&:hover fieldset": {
              borderColor: mode === "dark" ? "rgba(139, 92, 246, 0.4)" : "rgba(108, 99, 255, 0.4)",
            },
            "&.Mui-focused fieldset": {
              borderWidth: "1px",
              borderColor: mode === "dark" ? "#8B5CF6" : "#6C63FF",
            },
            "&.Mui-focused": {
              boxShadow: mode === "dark" ? "0 0 0 2px rgba(139, 92, 246, 0.15)" : "0 0 0 2px rgba(108, 99, 255, 0.08)",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          transition: "all 200ms ease",
        },
      },
    },
  },
});

const theme = createAppTheme();
export default theme;
