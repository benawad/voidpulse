import { ChartData } from "chart.js/auto";
import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import useResizeObserver from "use-resize-observer";
import { useCurrTheme } from "../../themes/useCurrTheme";
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { genId } from "../../utils/genId";
import { FunnelLabels } from "./FunnelLabels";
import { useChartTooltip } from "./useChartTooltip";
import useEventEmitter from "./useEventEmitter";

export const FunnelChart: React.FC<{
  data: ChartData<"bar", number[], string>;
  getTooltipData: GetTooltipData;
}> = ({ data, getTooltipData }) => {
  const $event = useEventEmitter<
    {
      id: string;
      x: number;
      y: number;
    }[][]
  >();
  const { ref, height, width } = useResizeObserver();
  const { external, tooltipNode } = useChartTooltip(getTooltipData);
  const { theme } = useCurrTheme();
  const lastDataRef = useRef<ChartData<"bar", number[], string> | null>(null);

  return (
    <div ref={ref} className="w-full h-full relative">
      <div className="w-full h-full absolute">
        <div className="w-full h-full relative">
          <Bar
            style={{
              width,
              height,
            }}
            data={data}
            plugins={[
              {
                id: "calculateLabelPositions",
                afterDraw: (chart) => {
                  const newLabelPositions = chart.data.datasets.map(
                    (dataset, datasetIndex) => {
                      const meta = chart.getDatasetMeta(datasetIndex);
                      return meta.data.map((element) => {
                        return {
                          id: genId(),
                          x: element.x,
                          y: element.y,
                        };
                      });
                    }
                  );
                  $event.emit(newLabelPositions);
                },
              },
            ]}
            options={{
              animation: false,
              maintainAspectRatio: false,
              resizeDelay: 1000,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: false,
                  external,
                },
              },
              scales: {
                x: {
                  stacked: true,
                  grid: {
                    drawOnChartArea: false,
                    lineWidth: 1,
                    color: [theme.primary[800]],
                  },
                  ticks: {
                    color: [theme.primary[500]],
                    autoSkip: true,
                    maxRotation: 0,
                    maxTicksLimit: 5,
                  },
                },
                //Y axis
                y: {
                  stacked: true,
                  grid: {
                    color: [theme.primary[800]],
                  },
                  ticks: {
                    color: [theme.primary[500]],
                    maxTicksLimit: 5,
                    callback: function (value) {
                      return `${value}%`;
                    },
                  },
                  border: {
                    color: "transparent",
                  },
                },
              },
              backgroundColor: "transparent",
            }}
          />
          {tooltipNode}
          <FunnelLabels $event={$event} data={data} />
        </div>
      </div>
    </div>
  );
};
