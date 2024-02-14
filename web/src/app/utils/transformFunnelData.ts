import { TooltipData } from "../ui/charts/ChartTooltip";
import { RouterOutput } from "./trpc";

export const transformFunnelChartData = ({
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
    data: {
      labels,
      datasets: [
        ...datas.map((data, i) => {
          return {
            label: "" + data.breakdown ?? `Step ${i + 1}`,
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
            backgroundColor: function (context: any) {
              const chart = context.chart;
              const { ctx, chartArea } = chart;

              if (!chartArea) {
                // This case happens on initial chart load
                return;
              }
              const gradient = ctx.createLinearGradient(
                0,
                chartArea.bottom,
                0,
                chartArea.top
              );
              gradient.addColorStop(
                1,
                colorOrder[i % colorOrder.length] + "80"
              );
              gradient.addColorStop(0, "transparent");

              return gradient;
            },
            stack: `stack${i}`,
          };
        }),
      ],
    },
    getTooltipData: (datasetIndex: number, dataIndex: number): TooltipData => {
      const dropOffBar = datasetIndex >= datas.length;
      const realIdx = dropOffBar ? datasetIndex - datas.length : datasetIndex;
      const { breakdown, steps } = datas[realIdx];
      const percent = steps[dataIndex].percent;
      const value = steps[dataIndex].value;
      return {
        title: typeof breakdown === "undefined" ? "Overall" : "" + breakdown,
        label: {
          highlight: `${dropOffBar ? (100 - percent).toFixed(2) : percent}%`,
          annotation: dropOffBar ? "drop-off" : "converted",
        },
        sublabel: {
          highlight: `${dropOffBar && dataIndex ? (steps[dataIndex - 1].value - value).toLocaleString() : value.toLocaleString()}`,
          annotation: `uniques`,
        },
        stripeColor: colorOrder[realIdx % colorOrder.length],
      };
    },
  };
};
