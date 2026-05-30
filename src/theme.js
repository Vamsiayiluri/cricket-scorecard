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
      default: mode === "dark" ? "#08111f" : "#f6f7fb",
      paper: mode === "dark" ? "#101827" : "#ffffff",
    },
    text: {
      primary: mode === "dark" ? "#F8FAFC" : "#111827",
      secondary: mode === "dark" ? "#A3AEC2" : "#64748b",
    },
    divider: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.09)",
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', 'Roboto', 'Helvetica', sans-serif",
    h1: { fontSize: "2.0rem", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.015em" },
    h3: { fontSize: "1.18rem", fontWeight: 750, lineHeight: 1.25, letterSpacing: 0 },
    h4: { fontSize: "1.05rem", fontWeight: 750, lineHeight: 1.3 },
    subtitle1: { fontSize: "0.925rem", fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: "0.9rem", lineHeight: 1.5 },
    body2: { fontSize: "0.84rem", lineHeight: 1.5 },
    caption: { fontSize: "0.73rem", fontWeight: 550, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            mode === "dark"
              ? "linear-gradient(180deg, #08111f 0%, #0b1423 100%)"
              : "linear-gradient(180deg, #f8fafc 0%, #f3f5fa 100%)",
          color: mode === "dark" ? "#F8FAFC" : "#111827",
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
          minHeight: 40,
          padding: "8px 16px",
          transition: "background-color 150ms ease, border-color 150ms ease, box-shadow 150ms ease",
          "&:hover": {
            boxShadow: mode === "dark" ? "0 6px 16px rgba(3, 8, 20, 0.28)" : "0 6px 16px rgba(15, 23, 42, 0.08)",
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
          backgroundColor: mode === "dark" ? "#101827" : "#ffffff",
          border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow:
            mode === "dark"
              ? "0 10px 28px -20px rgba(0, 0, 0, 0.65)"
              : "0 10px 28px -22px rgba(15, 23, 42, 0.25)",
          transition: "box-shadow 150ms ease, border-color 150ms ease",
          "&:hover": {
            borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15, 23, 42, 0.08)",
            boxShadow:
              mode === "dark"
                ? "0 12px 30px -22px rgba(0, 0, 0, 0.75)"
                : "0 12px 30px -24px rgba(15, 23, 42, 0.3)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 12,
          backgroundColor: mode === "dark" ? "#101827" : "#ffffff",
          border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(15, 23, 42, 0.08)",
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
            backgroundColor: mode === "dark" ? "#0b1220" : "#ffffff",
            transition: "border-color 150ms ease, box-shadow 150ms ease",
            "& fieldset": {
              borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.12)",
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          backgroundImage: "none",
          border: mode === "dark" ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: mode === "dark" ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.08)",
        },
        head: {
          backgroundColor: mode === "dark" ? "#0b1220" : "#f8fafc",
          color: mode === "dark" ? "#cbd5e1" : "#475569",
          fontWeight: 800,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const theme = createAppTheme();
export default theme;
