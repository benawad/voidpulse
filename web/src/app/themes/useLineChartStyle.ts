import { useCurrTheme } from "./useCurrTheme";

export const useLineChartStyle = () => {
  const { theme } = useCurrTheme();

  return {
    // fill: true,
    tension: 0.1,
    borderColor: theme.accent["100"],
    pointRadius: 0,
    // pointHitRadius: 16,
    pointHoverRadius: 8,
    pointHoverBackgroundColor: theme.accent[100],
    pointBorderColor: "#fff",
  };
};
