import {
  ArcElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { ChartLegend } from "./ChartLegend";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip
);

// Note: I am choosing to spell Donut the shorter way for convenience.
interface DonutChartProps {
  data: ChartData<any, any, any>;
}
const formatter = Intl.NumberFormat("en", { notation: "compact" });

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const total: number = data.datasets?.[0].data?.reduce(
    (acc: number, val: number) => acc + val,
    0
  );
  return (
    <div>
      <ChartLegend
        labels={data.labels!}
        colors={data.datasets[0].backgroundColor}
      />
      <div className="p-3 relative flex justify-center items-center margin-0">
        <div style={{ maxWidth: 500, width: "100%" }}>
          <Doughnut
            className="z-10 relative"
            data={data}
            options={{
              animation: false,
              plugins: {
                legend: {
                  position: "top",
                  align: "center",
                },
              },
            }}
          />
          {/* Total events center label */}
          <div className="absolute z-0 top-0 bottom-0 my-auto right-0 left-0 mx-auto h-12">
            <div className="text-3xl font-bold text-center">
              {formatter.format(total)}
            </div>
            <div className="text-xs text-center">total</div>
          </div>
        </div>
      </div>
    </div>
  );
};
