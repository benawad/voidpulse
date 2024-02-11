import { barChartStyle } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";

export const transformToBarChartData = (
  datas: Extract<RouterOutput["getReport"]["datas"], { value: number }[]>,
  visibleDataMap?: Record<string, boolean> | null,
  highlightedId?: string | null
) => {
  const filteredData = datas.filter((data, i) => {
    return i < 10;
  });
  return {
    labels: filteredData.map((x) => x.breakdown ?? x.eventLabel),
    datasets: [
      {
        label: datas[0].eventLabel,
        data: filteredData.map((x) => x.value),
        ...barChartStyle,
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };
};
