import { ChartTimeRangeType } from "@voidpulse/api";
import { DbChart } from "./trpc";
import moment from "moment";

export const chartToTagline = (chart: DbChart) => {
  if (chart.timeRangeType === ChartTimeRangeType["30D"]) {
    return "Last 30 days";
  } else if (chart.timeRangeType === ChartTimeRangeType["7D"]) {
    return "Last 7 days";
  } else if (chart.timeRangeType === ChartTimeRangeType["Yesterday"]) {
    return "Yesterday";
  } else if (chart.timeRangeType === ChartTimeRangeType["Today"]) {
    return "Today";
  } else if (chart.timeRangeType === ChartTimeRangeType["Custom"]) {
    if (chart.from && chart.to) {
      return `${moment(chart.from).format("MMM Do, YYYY")} - ${moment(chart.to).format("MMM Do, YYYY")}`;
    }
  } else if (chart.timeRangeType === ChartTimeRangeType["3M"]) {
    return "Last 3 months";
  } else if (chart.timeRangeType === ChartTimeRangeType["6M"]) {
    return "Last 6 months";
  } else if (chart.timeRangeType === ChartTimeRangeType["12M"]) {
    return "Last 12 months";
  }

  return "";
};
