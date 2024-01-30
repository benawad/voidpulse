import config from "../../../../tailwind.config";
const colors = config.theme.extend.colors;

export const colorOrder = [
  colors.secondary["signature-100"],
  colors.secondary["complement-100"],
  colors.secondary["orange-100"],
  colors.secondary["red-100"],
  colors.secondary["yellow-100"],
  colors.secondary["purple-100"],
  colors.secondary["green-100"],
];

export const lineChartStyle = {
  fill: false,
  tension: 0.1,
  borderColor: colors.secondary["signature-100"],
  pointRadius: 0,
  pointHitRadius: 16,
  pointHoverRadius: 8,
  pointBorderColor: colors.secondary["signature-100"],
};

export const donutChartStyle = {
  backgroundColor: [...colorOrder],
  borderColor: ["transparent"],
  hoverOffset: 4,
};

export const barChartStyle = {
  backgroundColor: [...colorOrder],
  borderColor: ["transparent"],
  borderWidth: 2,
  borderRadius: 4,
  hoverBorderColor: [colors.primary[300]],
  hoverBorderRadius: 4,
};

export const generalChartOptions = {
  layout: {
    autoPadding: true,
  },
  // responsive: true,
  // maintainAspectRatio: false, // This is important to stretch in height
  plugins: {
    legend: {
      display: false,
    },

    tooltip: {
      borderColor: colors.primary[700],
      borderWidth: 1,
      backgroundColor: colors.primary[800],
      padding: 16,
      displayColors: true,
      boxPadding: 8,
      caretSize: 10,

      callbacks: {
        //TO DO: Fill this properly, this is placeholder function
        label: (context: {
          dataset: { label: string };
          parsed: { y: number | bigint | null };
        }) => {
          let label = context.dataset.label || "";

          // if (label) {
          //   label += ": ";
          // }
          // if (context.parsed.y !== null) {
          //   label += new Intl.NumberFormat("en-US", {
          //     style: "currency",
          //     currency: "USD",
          //   }).format(context.parsed.y);
          // }
          return label + ": " + context.parsed.y;
        },
      },
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
