import config from "../../../../tailwind.config";
const months = ["Jan 1", "Feb 1", "Mar 1", "Apr 1", "May 1", "Jun 1", "Jul 1"];
const colors = config.theme.extend.colors;

export const generalChartOptions = {
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

  //All of these are important for making the axes look good
  scales: {
    //These options format the x axis
    x: {
      grid: {
        //The little legs at the bottom of the chart
        drawOnChartArea: false,
        lineWidth: 1,
        color: [colors.primary[800]],
      },
      //The labels and increments
      ticks: {
        color: [colors.primary[500]],
        drawTicks: true,
        autoSkip: true,
        maxRotation: 0,
        maxTicksLimit: 5,
        padding: 4,
      },
    },
    //Y axis
    y: {
      stackWeight: 1,
      grid: {
        color: [colors.primary[800]],
      },
      ticks: {
        color: [colors.primary[500]],
        padding: 16,
        maxTicksLimit: 5,
      },
      border: {
        color: "transparent",
      },
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
      tension: 0.1,
      borderColor: colors.secondary["zen-100"],
      pointRadius: 0,
      pointHitRadius: 16,
      pointHoverRadius: 8,
      pointBorderColor: colors.secondary["zen-100"],
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
        colors.secondary["psyche-100"],
      ],
      borderColor: ["transparent"],
      borderWidth: 2,
      borderRadius: 4,
      hoverBorderColor: [colors.primary[300]],
      hoverBorderRadius: 4,
    },
  ],
};
