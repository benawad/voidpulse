import { Chart } from "chart.js";
import React from "react";
import { Line } from "react-chartjs-2";
import { placeholderLineData } from "./PlaceholderChartData";

interface LineChartProps {
  data: any;
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const chartOptions = {
    layout: {
      autoPadding: true,
    },
    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div>
      <Line data={data} options={chartOptions}></Line>
    </div>
  );
};
