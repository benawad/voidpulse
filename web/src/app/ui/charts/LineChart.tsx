import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  TooltipItem,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import config from "../../../../tailwind.config";
import { stripeTooltipPlugin, verticalLinePlugin } from "./ChartStyle";
import { MetricMeasurement } from "@voidpulse/api";
const colors = config.theme.extend.colors;

// Register ChartJS components using ChartJS.register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

interface LineChartProps {
  disableAnimations?: boolean;
  data: any;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  disableAnimations,
}) => {
  return (
    <div className="w-full">
      <Line
        style={{
          height: 400,
          display: "block",
        }}
        data={data}
        options={{
          layout: {
            autoPadding: true,
          },
          maintainAspectRatio: false,
          // responsive: true,
          // maintainAspectRatio: false, // This is important to stretch in height
          hover: {
            mode: "nearest",
            intersect: false,
          },
          plugins: {
            legend: {
              display: false,
            },
            // datalabels: {
            //   display: false,
            // },
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
                // drawTicks: true,
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
          ...(disableAnimations
            ? {
                animation: false,
                animations: {
                  colors: false,
                  x: false,
                },
                transitions: {
                  active: {
                    animation: {
                      duration: 0,
                    },
                  },
                },
              }
            : {}),
        }}
        plugins={[verticalLinePlugin, stripeTooltipPlugin]}
      />
    </div>
  );
};
