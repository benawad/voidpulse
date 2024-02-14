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
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { useChartTooltip } from "./useChartTooltip";
import { numFormatter } from "../../utils/numFormatter";

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
  getTooltipData: GetTooltipData;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  getTooltipData,
}) => {
  const { external, onHover, tooltipNode } = useChartTooltip(
    getTooltipData,
    true
  );
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
      <div className="p-3 flex justify-center items-center margin-0">
        <div className="relative" style={{ maxWidth: 500, width: "100%" }}>
          <Doughnut
            data={data}
            options={{
              animation: false,
              onHover,
              plugins: {
                legend: {
                  position: "top",
                  align: "center",
                },
                tooltip: {
                  enabled: false,
                  animation: false,
                  external,
                },
              },
            }}
          />
          {tooltipNode}
          {/* Total events center label */}
          <div className="absolute z-0 top-0 bottom-0 my-auto right-0 left-0 mx-auto h-12">
            <div className="text-3xl font-bold text-center">
              {numFormatter.format(total)}
            </div>
            <div className="text-xs text-center">total</div>
          </div>
        </div>
      </div>
    </div>
  );
};
