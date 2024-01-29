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
import { generalChartOptions } from "./ChartStyle";

// Register ChartJS components using ChartJS.register
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

interface LineChartProps {
  data: any;
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <div>
      <Line data={data} options={generalChartOptions}></Line>
    </div>
  );
};
