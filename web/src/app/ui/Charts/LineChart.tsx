import React from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Chart, Line } from "react-chartjs-2";

import {
  generalChartOptions,
  placeholderLineData,
} from "./PlaceholderChartData";

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
