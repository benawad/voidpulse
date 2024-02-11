import React, { useContext, useMemo } from "react";
import { useLocalStorage } from "../utils/useLocalStorage";
import { ThemeId } from "@voidpulse/api";
import { colors } from "./colors";

type CurrThemeContextType = {
  themeId: ThemeId;
  theme: (typeof colors)[ThemeId];
  setThemeId: (themeId: ThemeId) => void;
};

export const CurrThemeContext = React.createContext<CurrThemeContextType>({
  themeId: ThemeId.default,
  theme: colors[ThemeId.default],
  setThemeId: () => {},
});

export const CurrThemeProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [themeId, setThemeId] = useLocalStorage("theme", ThemeId.default);

  return (
    <CurrThemeContext.Provider
      value={useMemo(
        () => ({
          themeId,
          theme: colors[themeId],
          setThemeId,
        }),
        [themeId]
      )}
    >
      {children}
    </CurrThemeContext.Provider>
  );
};
