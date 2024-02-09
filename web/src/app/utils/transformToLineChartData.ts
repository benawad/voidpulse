import { ChartType, DateHeader, MetricMeasurement } from "@voidpulse/api";
import { colorOrder, lineChartStyle } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";

export const transformToLineChartData = (
  datas: Extract<
    RouterOutput["getReport"]["datas"],
    { average_count: number }[]
  >,
  dateHeader: DateHeader[],
  visibleDataMap?: Record<string, boolean> | null,
  highlightedId?: string | null
) => {
  return {
    labels: dateHeader.map((d) => d.label),
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
          tooltips: dateHeader.map((d) => {
            return {
              title: data.eventLabel,
              afterTitle: data.breakdown || "",
              beforeLabel: d.fullLabel,
              appendToLabel: data.measurement
                ? {
                    [MetricMeasurement.totalEvents]: "events",
                    [MetricMeasurement.uniqueUsers]: "users",
                  }[data.measurement]
                : "",
            };
          }),
          data: dateHeader.map((d) => data.data[d.lookupValue] || 0),
        };
      }),
  };
};
