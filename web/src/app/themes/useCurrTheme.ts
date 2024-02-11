import { useContext } from "react";
import { CurrThemeContext } from "./CurrThemeProvider";

export const useCurrTheme = () => useContext(CurrThemeContext);
