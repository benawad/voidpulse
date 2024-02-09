import React from "react";
import { Bar } from "react-chartjs-2";
import { getGeneralChartOptions } from "./ChartStyle";
import {
  Chart as ChartJS,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement);

interface BarChartProps {
  data: any;
}

const barChartOptions = {
  ...getGeneralChartOptions,
  maintainAspectRatio: false,
};

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  return (
    <div>
      <Bar
        data={data}
        options={barChartOptions}
        style={{
          height: 400,
          display: "block",
        }}
      />
    </div>
  );
};
