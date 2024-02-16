import { FloatingPortal } from "@floating-ui/react";
import {
  BarController,
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  LinearScale,
} from "chart.js";
import React, { useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import useResizeObserver from "use-resize-observer";
import { GetTooltipData } from "../../utils/createExternalTooltipHandler";
import { numFormatter } from "../../utils/numFormatter";
import { useChartTooltip } from "./useChartTooltip";
import { genId } from "../../utils/genId";
import useEventEmitter from "./useEventEmitter";
import { BarLabels } from "./BarLabels";

ChartJS.register(BarController, CategoryScale, LinearScale, BarElement);

interface BarChartProps {
  data: any;
  getTooltipData: GetTooltipData;
}

export const BarChart: React.FC<BarChartProps> = ({ data, getTooltipData }) => {
  const $event = useEventEmitter<
    {
      id: string;
      x: number;
      y: number;
    }[][]
  >();
  const { ref, height, width } = useResizeObserver();
  const {
    external,
    onHover,
    tooltipNode: toolipNode,
  } = useChartTooltip(getTooltipData, true);

  return (
    <div ref={ref} className="w-full h-full relative">
      <div className="absolute h-full w-full">
        <div className="relative w-full h-full">
          <Bar
            style={{
              width,
              height,
            }}
            data={data}
            options={{
              maintainAspectRatio: false,
              animation: false,
              resizeDelay: 1000,
              indexAxis: "y",
              onHover,
              layout: {
                padding: {
                  right: 20,
                },
              },
              plugins: {
                tooltip: {
                  enabled: false,
                  animation: false,
                  external,
                },
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  border: {
                    display: false,
                  },
                  grid: {
                    display: false,
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  display: false,
                },
              },
            }}
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
          />
          {toolipNode}
          <BarLabels $event={$event} data={data} />
        </div>
      </div>
    </div>
  );
};
