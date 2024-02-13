import { useColorOrder } from "./useColorOrder";
import { useCurrTheme } from "./useCurrTheme";

export const useChartStyle = () => {
  const { theme } = useCurrTheme();
  const colorOrder = useColorOrder();

  return {
    line: {
      // fill: true,
      tension: 0.1,
      borderColor: theme.accent["100"],
      pointRadius: 0,
      // pointHitRadius: 16,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: theme.accent[100],
      pointBorderColor: "#fff",
    },
    bar: {
      backgroundColor: [...colorOrder],
      borderColor: ["transparent"],
      borderWidth: 2,
      borderRadius: 4,
      hoverBorderColor: [theme.primary[300]],
      hoverBorderRadius: 4,
    },
    donut: {
      backgroundColor: [...colorOrder],
      borderColor: ["transparent"],
      hoverOffset: 4,
    },
  };
};
