import Chart, { ChartData } from "chart.js/auto";
import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useCurrTheme } from "../../themes/useCurrTheme";
import { useColorOrder } from "../../themes/useColorOrder";

export const FunnelChart: React.FC<{
  data: ChartData<"bar", number[], string>;
}> = ({ data }) => {
  const { theme } = useCurrTheme();
  const colorOrder = useColorOrder();
  const chartRef = useRef<Chart<"bar", number[], string>>(null);
  const [labelPositions, setLabelPositions] = useState<
    {
      x: number;
      y: number;
    }[][]
  >([]);

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      const ctx = chart.ctx;

      const startingIdx = chart.data.datasets.length / 2;
      for (let i = startingIdx; i < chart.data.datasets.length; i++) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(
          0,
          colorOrder[(i - startingIdx) % colorOrder.length] + "80"
        );
        gradient.addColorStop(1, "transparent");
        chart.data.datasets[i].backgroundColor = gradient;
      }
      chart.update();
    }
  }, [data]);

  return (
    <div>
      <Bar
        ref={chartRef}
        data={data}
        plugins={[
          {
            id: "calculateLabelPositions",
            afterDraw: (chart) => {
              const newLabelPositions = chart.data.datasets.map(
                (dataset, datasetIndex) => {
                  const meta = chart.getDatasetMeta(datasetIndex);
                  return meta.data.map((element) => {
                    const canvasPosition = chart.canvas.getBoundingClientRect();
                    return {
                      x: element.x + canvasPosition.left + window.scrollX,
                      y: element.y + canvasPosition.top + window.scrollY - 10, // Adjust as needed
                    };
                  });
                }
              );
              setLabelPositions(newLabelPositions);
            },
          },
        ]}
        options={{
          animation: false,
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
                padding: 4,
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
                padding: 16,
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
      {labelPositions.map((positions, datasetIndex) => {
        return positions.map((pos, index) => {
          const info = (data.datasets[datasetIndex] as any).inlineLabels?.[
            index
          ];

          if (!info) {
            return null;
          }

          return (
            <div
              key={datasetIndex}
              style={{
                position: "absolute",
                left: `${pos.x}px`,
                top: `${pos.y - 10}px`,
                transform: "translateX(-50%)", // Center horizontally
                padding: "4px 8px",
                backgroundColor: "black",
                color: "white",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              <div>{info.percent}%</div>
              <div>{info.value.toLocaleString()}</div>
            </div>
          );
        });
      })}
    </div>
  );
};
