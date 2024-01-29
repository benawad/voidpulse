import React from "react";
import { Bar } from "react-chartjs-2";
import { genericChartOptions } from "./PlaceholderChartData";

interface BarChartProps {
  data: any;
}

const barChartOptions = {
  ...genericChartOptions,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div>
      <Bar data={data} options={barChartOptions}></Bar>
    </div>
  );
};
