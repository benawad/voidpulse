import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartData,
  Chart as ChartJS,
  LinearScale,
} from "chart.js";
import React, { useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { useChartTooltip } from "./useChartTooltip";
import { numFormatter } from "../../utils/numFormatter";
import { useCurrTheme } from "../../themes/useCurrTheme";
import { FloatingPortal } from "@floating-ui/react";

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement);

interface BarChartProps {
  data: any;
  getTooltipData: GetTooltipData;
}

export const BarChart: React.FC<BarChartProps> = ({ data, getTooltipData }) => {
  const {
    external,
    onHover,
    tooltipNode: toolipNode,
  } = useChartTooltip(getTooltipData, true);
  const { theme } = useCurrTheme();
  const lastDataRef = useRef<ChartData<"bar", number[], string> | null>(null);
  const [labelPositions, setLabelPositions] = useState<
    {
      x: number;
      y: number;
    }[][]
  >([]);

  return (
    <div>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          animation: false,
          indexAxis: "y",
          onHover,
          layout: {
            padding: {
              right: 20,
            },
          },
          plugins: {
            tooltip: {
              enabled: false,
              animation: false,
              external,
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              border: {
                display: false,
              },
              grid: {
                display: false,
              },
            },
            x: {
              grid: {
                display: false,
              },
              display: false,
            },
          },
        }}
        style={{
          height: data.datasets[0].data.length * 30,
          display: "block",
        }}
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
      />
      {toolipNode}
      {labelPositions.map((positions, datasetIndex) => {
        return positions.map((pos, index) => {
          return (
            <FloatingPortal key={index}>
              <div
                className="mono-body cursor-default"
                style={{
                  position: "absolute",
                  left: `${pos.x}px`,
                  top: `${pos.y - 12}px`,
                  padding: "4px 8px",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                {numFormatter.format(data.datasets[datasetIndex].data[index])}
              </div>
            </FloatingPortal>
          );
        });
      })}
    </div>
  );
};
