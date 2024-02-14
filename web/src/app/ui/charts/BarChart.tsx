import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
} from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { useChartTooltip } from "./useChartTooltip";
import { numFormatter } from "../../utils/numFormatter";

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
  } = useChartTooltip(getTooltipData);

  return (
    <div>
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          animation: false,
          // onHover,
          plugins: {
            tooltip: {
              enabled: false,
              animation: false,
              external,
            },
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  return numFormatter.format(value as number);
                },
              },
            },
          },
        }}
        style={{
          height: 400,
          display: "block",
        }}
      />
      {toolipNode}
    </div>
  );
};
