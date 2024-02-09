import { ChartType, DateHeader } from "@voidpulse/api";
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
  const fullDates = dateHeader.map((d) => d.fullLabel);
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
          measurement: data.measurement,
          breakdown: data.breakdown || "",
          fullDates,
          data: dateHeader.map((d) => data.data[d.lookupValue] || 0),
        };
      }),
  };
};
