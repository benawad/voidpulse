import "@formatjs/intl-numberformat/polyfill";
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import useResizeObserver from "use-resize-observer";
import { useCurrTheme } from "../../themes/useCurrTheme";
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { numFormatter } from "../../utils/numFormatter";
import { ChartLegend } from "./ChartLegend";
import { useChartTooltip } from "./useChartTooltip";

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
  yPercent?: boolean;
  getTooltipData: GetTooltipData;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  disableAnimations,
  yPercent,
  getTooltipData,
}) => {
  const { ref, height, width } = useResizeObserver();
  const { theme } = useCurrTheme();
  const { external, tooltipNode } = useChartTooltip(getTooltipData);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mt-2">
        <ChartLegend
          labels={data.datasets.map((x: any) => x.label) as string[]}
          colors={data.datasets[0].backgroundColor as string[]}
        />
      </div>
      <div ref={ref} className="w-full flex-1 relative">
        <div className="absolute w-full h-full">
          <div className="w-full h-full">
            <Line
              width={width}
              height={height}
              style={{
                width,
                height,
              }}
              className="w-full h-full"
              data={data}
              options={{
                resizeDelay: 1000,
                layout: {
                  autoPadding: true,
                },
                maintainAspectRatio: false,
                responsive: true,
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
                    enabled: false,
                    mode: "nearest",
                    intersect: false,
                    borderColor: theme.primary[700],
                    borderWidth: 1,
                    backgroundColor: theme.primary[800],
                    padding: 16,
                    displayColors: false,
                    boxPadding: 8,
                    caretSize: 10,
                    animation: false,
                    external,
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
                      color: [theme.primary[800]],
                    },
                    //The labels and increments
                    ticks: {
                      color: [theme.primary[500]],
                      // drawTicks: true,
                      autoSkip: true,
                      // maxRotation: 0,
                      maxTicksLimit: 5,
                      padding: 4,
                    },
                  },
                  //Y axis
                  y: {
                    stackWeight: 1,
                    grid: {
                      color: [theme.primary[800]],
                    },
                    ticks: {
                      color: [theme.primary[500]],
                      padding: 16,
                      maxTicksLimit: 5,
                      callback: yPercent
                        ? function (value) {
                            return `${value}%`; // Append a percentage sign to each label
                          }
                        : function (value) {
                            return numFormatter.format(value as number);
                          },
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
              plugins={[
                {
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
                      ctx.strokeStyle = theme.primary[800];
                      ctx.stroke();
                      ctx.restore();
                    }
                  },
                },
                // stripeTooltipPlugin,
              ]}
            />
          </div>
          {tooltipNode}
        </div>
      </div>
    </div>
  );
};
