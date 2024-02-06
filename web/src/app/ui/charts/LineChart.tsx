import React from "react";
import { Chart, Line } from "react-chartjs-2";
import { placeholderLineData } from "./PlaceholderChartData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  PointElement,
  LineElement,
} from "chart.js";
import {
  generalChartOptions,
  lineChartStyle,
  stripeTooltipPlugin,
  verticalLinePlugin,
} from "./ChartStyle";

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
  const noAnims = {
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
  };
  return (
    <div>
      <Line
        data={data}
        options={{
          ...generalChartOptions,
          ...(disableAnimations ? noAnims : {}),
        }}
        plugins={[verticalLinePlugin, stripeTooltipPlugin]}
      />
    </div>
  );
};
