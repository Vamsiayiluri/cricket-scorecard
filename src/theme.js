import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Custom primary color
    },
    secondary: {
      main: "#ff5722", // Custom secondary color
    },
  },
  breakpoints: {
    values: {
      xs: 0, // Mobile
      sm: 600, // Tablet
      md: 960, // Small laptop
      lg: 1280, // Desktop
      xl: 1920, // Large screen
    },
  },
  typography: {
    h1: {
      fontSize: "2rem",
      [theme.breakpoints.down("sm")]: {
        fontSize: "1.5rem",
      },
    },
  },
});

export default theme;
