import React, { createContext, useContext } from "react";

const ThemeModeContext = createContext({
  mode: "light",
  toggleMode: () => {},
});

export const ThemeModeProvider = ThemeModeContext.Provider;

export const useThemeMode = () => useContext(ThemeModeContext);

