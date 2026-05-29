/* eslint-disable react/prop-types */
import { Alert } from "@mui/material";

const StepErrorAlert = ({ message }) => {
  if (!message) {
    return null;
  }
  return (
    <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-live="assertive">
      {message}
    </Alert>
  );
};

export default StepErrorAlert;
