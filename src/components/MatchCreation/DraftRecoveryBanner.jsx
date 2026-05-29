import React from "react";
import { Alert, Button, Stack } from "@mui/material";

const DraftRecoveryBanner = ({ savedAt, onRestore, onDiscard }) => {
  const savedLabel = savedAt
    ? new Date(savedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "earlier";

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <Stack spacing={1}>
        <span>Unfinished match setup found (saved {savedLabel}). Restore your progress?</span>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" onClick={onRestore}>
            Restore Draft
          </Button>
          <Button size="small" variant="outlined" color="inherit" onClick={onDiscard}>
            Discard
          </Button>
        </Stack>
      </Stack>
    </Alert>
  );
};

export default DraftRecoveryBanner;
