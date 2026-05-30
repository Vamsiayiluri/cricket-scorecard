/* eslint-disable react/prop-types */
import { Alert, Stack } from "@mui/material";

const ErrorState = ({ message = "Something went wrong. Please try again." }) => {
  return (
    <Stack sx={{ py: 2 }}>
      <Alert severity="error" sx={{ border: "1px solid", borderColor: "divider" }}>
        {message}
      </Alert>
    </Stack>
  );
};

export default ErrorState;
