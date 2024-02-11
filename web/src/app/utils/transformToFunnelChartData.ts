import { barChartStyle, colorOrder } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";

export const transformToFunnelChartData = (
  datas: Extract<RouterOutput["getReport"]["datas"], { steps: any[] }[]>,
  visibleDataMap?: Record<string, boolean> | null,
  highlightedId?: string | null
) => {
  return {
    labels: datas[0].steps.map((_, i) => `Step ${i + 1}`),
    datasets: [
      ...datas.map((data, i) => {
        return {
          label: data.breakdown || `Step ${i + 1}`,
          data: data.steps.map((x) => x.percent),
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
