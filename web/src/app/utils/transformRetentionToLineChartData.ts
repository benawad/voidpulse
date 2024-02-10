import { ChartType, DateHeader, RetentionNumFormat } from "@voidpulse/api";
import { colorOrder, lineChartStyle } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";

export const transformRetentionToLineChartData = (
  datas: Extract<
    RouterOutput["getReport"]["datas"],
    { averageRetentionByDay: any }[]
  >,
  retHeaders: DateHeader[],
  visibleDataMap?: Record<string, boolean> | null,
  highlightedId?: string | null,
  retentionNumFormat?: RetentionNumFormat | null
) => {
  return {
    labels: retHeaders.map((d) => d.label),
    datasets: datas
      .filter((d, i) => {
        if (!visibleDataMap) {
          return i < 10;
        }
        return visibleDataMap[d.id];
      })
      .map((data, i) => {
        const col = colorOrder[i % colorOrder.length];
        return {
          ...lineChartStyle,
          borderWidth: data.id === highlightedId ? 4 : 2,
          borderColor: col,
          pointHoverBackgroundColor: col,
          label: data.eventLabel,
          tooltips: retHeaders.map((d, i) => {
            return {
              title: d.fullLabel,
              afterTitle: data.breakdown || "",
              beforeLabel: `${
                data.averageRetentionByDay[i]?.avgRetainedPercent || 0
              }% retention`,
              label: `${
                data.averageRetentionByDay[i]?.avgRetained || 0
              } users (average)`,
            };
          }),
          data: retHeaders.map(
            (_, i) =>
              (retentionNumFormat === RetentionNumFormat.rawCount
                ? data.averageRetentionByDay[i]?.avgRetained
                : data.averageRetentionByDay[i]?.avgRetainedPercent) || 0
          ),
        };
      }),
  };
};
