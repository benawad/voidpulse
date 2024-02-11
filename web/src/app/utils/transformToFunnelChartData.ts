import { RouterOutput } from "./trpc";

export const transformToFunnelChartData = ({
  datas,
  labels,
  colorOrder,
  visibleDataMap,
  highlightedId,
}: {
  datas: Extract<RouterOutput["getReport"]["datas"], { steps: any[] }[]>;
  labels: string[];
  colorOrder: string[];
  visibleDataMap?: Record<string, boolean> | null;
  highlightedId?: string | null;
}) => {
  return {
    labels,
    datasets: [
      ...datas.map((data, i) => {
        return {
          label: data.breakdown || `Step ${i + 1}`,
          data: data.steps.map((x) => x.percent),
          inlineLabels: data.steps.map((x, k) => {
            return {
              percent: x.percent,
              value: x.value,
            };
          }),
          backgroundColor: colorOrder[i % colorOrder.length],
          stack: `stack${i}`,
        };
      }),
      ...datas.map((data, i) => {
        return {
          label: `Dropoff ${i + 1}`,
          data: data.steps.map((x, i) =>
            !i ? 0 : data.steps[i - 1].percent - x.percent
          ),
          backgroundColor: "",
          stack: `stack${i}`,
        };
      }),
    ],
  };
};
