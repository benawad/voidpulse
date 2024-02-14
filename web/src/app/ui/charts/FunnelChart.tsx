import { FloatingPortal } from "@floating-ui/react";
import Chart, { ChartData } from "chart.js/auto";
import React, { useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useCurrTheme } from "../../themes/useCurrTheme";
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { useChartTooltip } from "./useChartTooltip";

export const FunnelChart: React.FC<{
  data: ChartData<"bar", number[], string>;
  getTooltipData: GetTooltipData;
}> = ({ data, getTooltipData }) => {
  const { external, tooltipNode } = useChartTooltip(getTooltipData);
  const { theme } = useCurrTheme();
  const chartRef = useRef<Chart<"bar", number[], string>>(null);
  const lastDataRef = useRef<ChartData<"bar", number[], string> | null>(null);
  const [labelPositions, setLabelPositions] = useState<
    {
      x: number;
      y: number;
    }[][]
  >([]);

  return (
    <div style={{ height: 400 }}>
      <Bar
        ref={chartRef}
        data={data}
        plugins={[
          {
            id: "calculateLabelPositions",
            afterDraw: (chart) => {
              const { top, left } = chart.canvas.getBoundingClientRect();
              const newLabelPositions = chart.data.datasets.map(
                (dataset, datasetIndex) => {
                  const meta = chart.getDatasetMeta(datasetIndex);
                  return meta.data.map((element) => {
                    return {
                      x: left + element.x,
                      y: top + element.y,
                    };
                  });
                }
              );
              if (lastDataRef.current !== data) {
                lastDataRef.current = data;
                setLabelPositions(newLabelPositions);
              }
            },
          },
        ]}
        options={{
          animation: false,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              enabled: false,
              external,
            },
          },
          scales: {
            x: {
              stacked: true,
              grid: {
                drawOnChartArea: false,
                lineWidth: 1,
                color: [theme.primary[800]],
              },
              ticks: {
                color: [theme.primary[500]],
                autoSkip: true,
                maxRotation: 0,
                maxTicksLimit: 5,
              },
            },
            //Y axis
            y: {
              stacked: true,
              grid: {
                color: [theme.primary[800]],
              },
              ticks: {
                color: [theme.primary[500]],
                maxTicksLimit: 5,
                callback: function (value) {
                  return `${value}%`;
                },
              },
              border: {
                color: "transparent",
              },
            },
          },
          backgroundColor: "transparent",
        }}
      />
      {tooltipNode}
      {labelPositions.map((positions, datasetIndex) => {
        return positions.map((pos, index) => {
          const info = (data.datasets[datasetIndex] as any).inlineLabels?.[
            index
          ];

          if (!info) {
            return null;
          }

          return (
            <FloatingPortal key={index}>
              <div
                className="bg-primary-800 border border-primary-700 rounded-lg shadow-lg mono-body cursor-default"
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y - 10}px`,
                  transform: "translateX(-50%)", // Center horizontally
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                <div className="text-primary-100 text-center">
                  {info.percent}%
                </div>
                <div className="text-primary-500 text-center">
                  {info.value.toLocaleString()}
                </div>
              </div>
            </FloatingPortal>
          );
        });
      })}
    </div>
  );
};
