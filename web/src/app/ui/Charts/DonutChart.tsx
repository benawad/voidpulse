import React from "react";
import { ChartLegend } from "./ChartLegend";
import { Doughnut } from "react-chartjs-2";
import { ChartData } from "chart.js";
import { genericChartOptions } from "./PlaceholderChartData";

// Note: I am choosing to spell Donut the shorter way for convenience.
interface DonutChartProps {
  data: ChartData<any, any, any>;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  return (
    <div>
      <ChartLegend
        labels={data.labels!}
        colors={data.datasets[0].backgroundColor}
      />
      <div className="p-3 relative flex justify-center items-center margin-0">
        <Doughnut data={data} options={genericChartOptions} />
        {/* Total events center label */}
        <div className="absolute top-0 bottom-0 my-auto right-0 left-0 mx-auto h-12">
          <div className="text-3xl font-bold text-center">99</div>
          <div className="text-xs text-center">total</div>
        </div>
      </div>
    </div>
  );
};
