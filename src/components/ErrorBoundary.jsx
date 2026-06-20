/* eslint-disable react/prop-types */
import { Component } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { captureError } from "../services/monitoring/sentryService";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, eventId: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    captureError(error, {
      label: "React ErrorBoundary",
      componentStack: info?.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        <Stack alignItems="center" spacing={2.5} sx={{ maxWidth: 440, textAlign: "center" }}>
          <ErrorOutlineIcon sx={{ fontSize: 52, color: "error.main", opacity: 0.8 }} />
          <Box>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              An unexpected error occurred. This has been reported automatically.
              Try refreshing the page — if the problem persists, contact support.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ background: "linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)" }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
            >
              Go to Dashboard
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }
}

export default ErrorBoundary;
