import React from "react";
import { Bar } from "react-chartjs-2";
import { genericChartOptions } from "./PlaceholderChartData";

interface BarChartProps {
  data: any;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div>
      <Bar data={data} options={genericChartOptions}></Bar>
    </div>
  );
};
