import { DateHeader, RetentionNumFormat } from "@voidpulse/api";
import { RouterOutput } from "./trpc";
import { TooltipData } from "../ui/charts/ChartTooltip";

export const transformRetentionData = ({
  datas,
  colorOrder,
  retHeaders,
  visibleDataMap,
  highlightedId,
  retentionNumFormat,
  lineChartStyle,
}: {
  datas: Extract<
    RouterOutput["getReport"]["datas"],
    { averageRetentionByDay: any }[]
  >;
  lineChartStyle: any;
  colorOrder: string[];
  retHeaders: DateHeader[];
  visibleDataMap?: Record<string, boolean> | null;
  highlightedId?: string | null;
  retentionNumFormat?: RetentionNumFormat | null;
}) => {
  const filteredData = datas.filter((d, i) => {
    if (!visibleDataMap) {
      return i < 10;
    }
    return visibleDataMap[d.id];
  });
  const datasets = filteredData.map((data, i) => {
    const col = colorOrder[i % colorOrder.length];
    return {
      ...lineChartStyle,
      borderWidth: data.id === highlightedId ? 4 : 2,
      borderColor: col,
      pointHoverBackgroundColor: col,
      backgroundColor: colorOrder,
      label: data.eventLabel,
      data: retHeaders.map(
        (_, i) =>
          (retentionNumFormat === RetentionNumFormat.rawCount
            ? data.averageRetentionByDay[i]?.avgRetained
            : data.averageRetentionByDay[i]?.avgRetainedPercent) || 0
      ),
    };
  });
  return {
    data: {
      labels: retHeaders.map((d) => d.label),
      datasets,
    },
    getTooltipData: (datasetIndex: number, dataIndex: number): TooltipData => {
      const { breakdown, averageRetentionByDay } = filteredData[datasetIndex];
      const { borderColor } = datasets[datasetIndex];
      return {
        title: retHeaders[dataIndex].fullLabel,
        subtitle: typeof breakdown === "undefined" ? "" : "" + breakdown,
        label: {
          highlight:
            (
              averageRetentionByDay[dataIndex]?.avgRetainedPercent || 0
            ).toLocaleString() + "%",
          annotation: `retention`,
        },
        sublabel: {
          highlight: (
            averageRetentionByDay[dataIndex]?.avgRetained || 0
          ).toLocaleString(),
          annotation: `users (average)`,
        },
        stripeColor: borderColor,
      };
    },
  };
};
