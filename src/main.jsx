import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";
import "./firebase-config";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./theme";
import { ToastProvider } from "./context/ToastContext";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { initSentry } from "./services/monitoring/sentryService";

initSentry();

const AppProviders = () => {
  const [mode, setMode] = React.useState("dark");
  const toggleMode = React.useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeProvider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ThemeModeProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <AppProviders />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
