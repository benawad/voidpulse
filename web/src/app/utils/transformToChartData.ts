import { lineChartStyle } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";

export const transformToChartData = (
  datas: RouterOutput["getInsight"]["datas"]
) => {
  return {
    labels: datas[0].map((d) => d.day),
    datasets: datas.map((data) => ({
      ...lineChartStyle,
      label: "My First Dataset",
      data: data.map((d) => d.count),
    })),
  };
};
