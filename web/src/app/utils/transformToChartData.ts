import moment from "moment";
import { colorOrder, lineChartStyle } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";

export const transformToChartData = (
  datas: RouterOutput["getInsight"]["datas"]
) => {
  return {
    labels: datas[0].data.map((d) =>
      moment("day" in d ? d.day : d[0]).format("MMM D")
    ),
    datasets: datas.map((data, i) => ({
      ...lineChartStyle,
      borderColor: colorOrder[i % colorOrder.length],
      label: data.eventLabel,
      measurement: data.measurement,
      breakdown: data.breakdown || "",
      fullDates: datas[0].data.map((d) =>
        moment("day" in d ? d.day : d[0]).format("ddd MMM DD, YYYY")
      ),
      data: data.data.map((d) => ("count" in d ? d.count : d[1])),
    })),
  };
};
