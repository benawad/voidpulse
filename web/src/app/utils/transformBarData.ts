import { MetricMeasurement } from "@voidpulse/api";
import { TooltipData } from "../ui/charts/ChartTooltip";
import { RouterOutput } from "./trpc";

export const transformBarData = ({
  datas,
  visibleDataMap,
  highlightedId,
  barChartStyle,
}: {
  datas: Extract<RouterOutput["getReport"]["datas"], { value: number }[]>;
  visibleDataMap?: Record<string, boolean> | null;
  highlightedId?: string | null;
  barChartStyle: any;
}) => {
  const filteredData = datas.filter((d, i) => {
    if (!visibleDataMap) {
      return i < 10;
    }
    return visibleDataMap[d.id];
  });
  return {
    data: {
      labels: filteredData.map((x) => x.breakdown ?? x.eventLabel),
      datasets: [
        {
          label: datas[0].eventLabel,
          data: filteredData.map((x) => x.value),
          ...barChartStyle,
          borderWidth: 0,
          barThickness: 16,
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
          annotation: "of overall",
        },
        stripeColor:
          barChartStyle.backgroundColor[
            dataIndex % barChartStyle.backgroundColor.length
          ],
      };
    },
  };
};
