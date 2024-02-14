import { MetricMeasurement } from "@voidpulse/api";
import { TooltipData } from "../ui/charts/ChartTooltip";
import { RouterOutput } from "./trpc";

export const transformDonutData = ({
  datas,
  visibleDataMap,
  highlightedId,
  donutChartStyle,
}: {
  datas: Extract<RouterOutput["getReport"]["datas"], { value: number }[]>;
  visibleDataMap?: Record<string, boolean> | null;
  highlightedId?: string | null;
  donutChartStyle: any;
}) => {
  const filteredData = datas.filter((d, i) => {
    if (!visibleDataMap) {
      return i < 10;
    }
    return visibleDataMap[d.id];
  });
  return {
    data: {
      labels: datas.map((x) => "" + (x.breakdown ?? x.eventLabel)),
      datasets: [
        {
          ...donutChartStyle,
          label: datas[0].eventLabel,
          data: filteredData.map((x) => x.value),
        },
      ],
    },
    getTooltipData: (datasetIndex: number, dataIndex: number): TooltipData => {
      const { measurement, breakdown } = filteredData[dataIndex];
      const total = filteredData.reduce((acc, d) => acc + d.value, 0);
      const value = filteredData[dataIndex].value;
      return {
        title: filteredData[datasetIndex].eventLabel,
        subtitle: typeof breakdown === "undefined" ? "" : "" + breakdown,
        label: {
          highlight: value.toLocaleString(),
          annotation: measurement
            ? {
                [MetricMeasurement.totalEvents]: "events",
                [MetricMeasurement.uniqueUsers]: "users",
              }[measurement]
            : "",
        },
        sublabel: {
          highlight: `${!total ? "0" : ((100 * value) / total).toFixed(2)}%`,
          annotation: "of total",
        },
        stripeColor:
          donutChartStyle.backgroundColor[
            dataIndex % donutChartStyle.backgroundColor.length
          ],
      };
    },
  };
};
