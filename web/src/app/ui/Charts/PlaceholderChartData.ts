import config from "../../../../tailwind.config";
const months = ["Jan 1", "Feb 1", "Mar 1", "Apr 1", "May 1", "Jun 1", "Jul 1"];
const colors = config.theme.extend.colors;

export const genericChartOptions = {
  layout: {
    autoPadding: true,
  },
  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      enabled: false,
    },
  },
};

export const placeholderLineData = {
  labels: months,
  datasets: [
    {
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

export const placeholderDonutData = {
  labels: ["Anxious", "Anger", "Sad", "Envy"],
  datasets: [
    {
      label: "My First Dataset",
      data: [300, 50, 100, 75],
      backgroundColor: [
        colors.secondary["zen-100"],
        colors.secondary["energy-100"],
        colors.secondary["mind-100"],
        colors.secondary["body-100"],
      ],
      borderColor: ["transparent"],
      hoverOffset: 4,
    },
  ],
};

export const placeholderBarData = {
  labels: months,
  datasets: [
    {
      label: "My First Dataset",
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        colors.secondary["zen-100"],
        colors.secondary["energy-100"],
        colors.secondary["mind-100"],
        colors.secondary["body-100"],
        colors.secondary["ego-100"],
        colors.secondary["aura-100"],
        colors.secondary["heart-100"],
      ],
      borderColor: ["transparent"],
      borderWidth: 2,
      borderRadius: 4,
      hoverBorderColor: [colors.primary[300]],
      hoverBorderRadius: 4,
    },
  ],
};
