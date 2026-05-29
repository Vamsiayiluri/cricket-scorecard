import React from "react";
import { Alert, Stack } from "@mui/material";

const ErrorState = ({ message = "Something went wrong. Please try again." }) => {
  return (
    <Stack sx={{ py: 2 }}>
      <Alert severity="error">{message}</Alert>
    </Stack>
  );
};

export default ErrorState;
