import { ChartOptions, Plugin, TooltipItem } from "chart.js";
import config from "../../../../tailwind.config";
const colors = config.theme.extend.colors;
import { ChartType, MetricMeasurement } from "@voidpulse/api";

export const colorOrder = [
  colors.secondary["signature-100"],
  colors.secondary["complement-100"],
  colors.secondary["blue-100"],
  colors.secondary["indigo-100"],
  colors.secondary["green-100"],
  colors.secondary["orange-100"],
  colors.secondary["purple-100"],
  colors.secondary["red-100"],
  colors.secondary["yellow-100"],
];

export const lineChartStyle = {
  // fill: true,
  tension: 0.1,
  borderColor: colors.secondary["signature-100"],
  pointRadius: 0,
  // pointHitRadius: 16,
  pointHoverRadius: 8,
  pointHoverBackgroundColor: colors.secondary["signature-100"],
  pointBorderColor: "#fff",
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

export const stripeTooltipPlugin: Plugin<"line"> = {
  id: "stripeTooltip",
  afterTooltipDraw: function (chart, args) {
    const tooltip = chart.tooltip;
    if (!tooltip || tooltip.opacity === 0 || tooltip.dataPoints.length === 0)
      return; // Do not draw if the tooltip is not visible or if there are no data points

    const ctx = chart.ctx;
    const tooltipWidth = tooltip.width;
    const tooltipHeight = tooltip.height;
    const tooltipX = tooltip.x;
    const tooltipY = tooltip.y;

    const stripeWidth = 4; // Width of the stripe

    // Get the dataset index and borderColor for the first tooltip item
    const datasetIndex = tooltip.dataPoints[0].datasetIndex;
    const dataset = chart.data.datasets[datasetIndex];
    const stripeColor = dataset.borderColor; // Use the dataset's line color for the stripe

    // Calculate the position for the stripe (right side of the tooltip)
    const stripeX = tooltipX + tooltipWidth - stripeWidth;

    // Save the current context state
    ctx.save();

    // Draw the stripe
    ctx.fillStyle = stripeColor as any; // Set the stripe color based on the dataset's line color
    ctx.fillRect(stripeX, tooltipY, stripeWidth, tooltipHeight);

    // Restore the previous context state
    ctx.restore();
  },
};

export const verticalLinePlugin: Plugin<"line"> = {
  id: "verticalLine",
  beforeDatasetsDraw: (chart) => {
    const tooltip = chart.tooltip;
    if (tooltip && tooltip.getActiveElements().length > 0) {
      const ctx = chart.ctx;
      const x = tooltip.getActiveElements()[0].element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.primary[800];
      ctx.stroke();
      ctx.restore();
    }
  },
};

export const getGeneralChartOptions = (chartType: ChartType) => {
  if (chartType === ChartType.donut) {
    return {};
  } else {
    return {
      layout: {
        autoPadding: true,
      },
      maintainAspectRatio: false,
      // responsive: true,
      // maintainAspectRatio: false, // This is important to stretch in height
      hover: {
        mode: "nearest",
        intersect: false,
        hoverAnimationDuration: 0,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          mode: "nearest",
          intersect: false,
          borderColor: colors.primary[700],
          borderWidth: 1,
          backgroundColor: colors.primary[800],
          padding: 16,
          displayColors: false,
          boxPadding: 8,
          caretSize: 10,
          animation: false,

          callbacks: {
            title: (tooltipItems: TooltipItem<"line">[]) => {
              return tooltipItems.length
                ? `${tooltipItems[0].dataset.label}`
                : "";
            },
            afterTitle: (tooltipItems: TooltipItem<"line">[]) => {
              return tooltipItems.length
                ? `${(tooltipItems[0].dataset as any).breakdown}`
                : "";
            },
            beforeLabel: (tooltipItem: TooltipItem<"line">) => {
              return (tooltipItem.dataset as any).fullDates[
                tooltipItem.dataIndex
              ];
            },
            label: (tooltipItem: TooltipItem<"line">) => {
              return `${tooltipItem.parsed.y?.toLocaleString()} ${
                (tooltipItem.dataset as any).measurement
                  ? {
                      [MetricMeasurement.totalEvents]: "events",
                      [MetricMeasurement.uniqueUsers]: "users",
                    }[
                      (tooltipItem.dataset as any)
                        .measurement as MetricMeasurement
                    ]
                  : ""
              }`;
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
    } as const;
  }
};
