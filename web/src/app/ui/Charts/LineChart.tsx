import { Chart } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  genericChartOptions,
  placeholderLineData,
} from "./PlaceholderChartData";

interface LineChartProps {
  data: any;
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <div>
      <Line data={data} options={genericChartOptions}></Line>
    </div>
  );
};
