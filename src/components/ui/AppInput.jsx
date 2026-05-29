/* eslint-disable react/prop-types */
import { TextField } from "@mui/material";

const AppInput = ({ sx, ...props }) => {
  return (
    <TextField
      variant="outlined"
      sx={{
        "& .MuiInputBase-root": {
          minHeight: 42,
          fontSize: "0.92rem",
          transition: "border-color 150ms ease, box-shadow 150ms ease",
        },
        "& .MuiInputLabel-root": {
          fontWeight: 700,
          fontSize: "0.9rem",
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default AppInput;
