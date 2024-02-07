import moment from "moment";
import { colorOrder, lineChartStyle } from "../ui/charts/ChartStyle";
import { RouterOutput } from "./trpc";
import { LineChartGroupByTimeType } from "@voidpulse/api";

export const transformToChartData = (
  datas: RouterOutput["getInsight"]["datas"]
) => {
  return {
    labels: datas[0].data.map((d) =>
      datas[0].lineChartGroupByTimeType === LineChartGroupByTimeType.month
        ? moment(d[0]).format("MMM")
        : moment(d[0]).format("MMM D")
    ),
    datasets: datas.map((data, i) => ({
      ...lineChartStyle,
      borderColor: colorOrder[i % colorOrder.length],
      label: data.eventLabel,
      measurement: data.measurement,
      breakdown: data.breakdown || "",
      fullDates: datas[0].data.map((d) =>
        datas[0].lineChartGroupByTimeType === LineChartGroupByTimeType.month
          ? moment(d[0]).format("MMM YYYY")
          : moment(d[0]).format("ddd MMM DD, YYYY")
      ),
      data: data.data.map((d) => d[1]),
    })),
  };
};
