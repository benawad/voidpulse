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
import useResizeObserver from "use-resize-observer";
import { CHART_RESIZE_DELAY } from "../../themes/useChartStyle";

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
  const { ref, height: _height, width: _width } = useResizeObserver();
  const width = _width && _height ? Math.min(_width, _height) : _width;
  const height = _width && _height ? Math.min(_width, _height) : _height;
  const { external, onHover, tooltipNode } = useChartTooltip(
    getTooltipData,
    true
  );
  const total: number = data.datasets?.[0].data?.reduce(
    (acc: number, val: number) => acc + val,
    0
  );

  return (
    <div className="w-full h-full">
      <div className="w-full h-full p-3 flex justify-center items-center margin-0">
        <div
          className="w-full h-full flex flex-col"
          style={{ maxWidth: 500, width: "100%" }}
        >
          <ChartLegend
            labels={data.labels as string[]}
            colors={data.datasets?.[0].backgroundColor as string[]}
          />
          <div ref={ref} className="relative mt-4 w-full flex-1">
            <div className="absolute w-full h-full flex justify-center">
              <div
                style={{
                  width: width && height ? Math.min(width, height) : width,
                  height: width && height ? Math.min(width, height) : height,
                }}
                className="relative"
              >
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
                {width && height ? (
                  <Doughnut
                    // width={width}
                    // height={height}
                    style={{
                      width,
                      height,
                    }}
                    className="z-10"
                    data={data}
                    options={{
                      animation: false,
                      responsive: true,
                      resizeDelay: CHART_RESIZE_DELAY,
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
                ) : null}
              </div>
              {tooltipNode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
