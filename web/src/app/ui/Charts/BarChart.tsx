import React from "react";
import { Bar } from "react-chartjs-2";

interface BarChartProps {
  data: any;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div>
      <Bar data={data}></Bar>
    </div>
  );
};
