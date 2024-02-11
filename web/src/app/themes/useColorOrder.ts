import { useCurrTheme } from "./useCurrTheme";

export const useColorOrder = () => {
  const { theme } = useCurrTheme();

  return [
    theme.accent["100"],
    theme.flair["100"],
    theme.chart["1"],
    theme.chart["2"],
    theme.chart["3"],
    theme.chart["4"],
    theme.chart["5"],
    theme.chart["6"],
    theme.chart["7"],
  ];
};
