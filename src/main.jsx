import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";
import "./firebase-config";
import { AuthProvider } from "./context/AuthContext";
// import { ThemeProvider } from "@mui/material/styles";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* <ThemeProvider theme={theme}> */}
      <AuthProvider>
        <App />
      </AuthProvider>
      {/* </ThemeProvider> */}
    </Provider>
  </React.StrictMode>
);
