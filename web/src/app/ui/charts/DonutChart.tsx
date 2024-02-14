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
      <div className="p-3 flex justify-center items-center margin-0">
        <div style={{ maxWidth: 500, width: "100%" }}>
          <ChartLegend
            labels={data.labels as string[]}
            colors={data.datasets?.[0].backgroundColor as string[]}
          />
          <div className="relative mt-4">
            {/* Total events center label */}
            <div
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              className="absolute"
            >
              <div className="text-3xl font-bold text-center">
                {numFormatter.format(total)}
              </div>
              <div className="text-xs text-center">total</div>
            </div>
            <Doughnut
              className="z-10"
              data={data}
              options={{
                animation: false,
                onHover,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    enabled: false,
                    animation: false,
                    external,
                  },
                },
              }}
            />
          </div>
          {tooltipNode}
        </div>
      </div>
    </div>
  );
};
