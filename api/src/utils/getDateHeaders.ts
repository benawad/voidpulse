import {
  ChartTimeRangeType,
  DateHeader,
  LineChartGroupByTimeType,
} from "../app-router-type";
import { DateTime } from "luxon";

export const getDateHeaders = (
  timeRangeType: ChartTimeRangeType,
  lineChartGroupByTimeType: LineChartGroupByTimeType,
  timezone: string,
  from?: string,
  to?: string
) => {
  const dateHeaders: DateHeader[] = [];
  const retentionHeaders: DateHeader[] = [];
  let startDate = from
    ? DateTime.fromISO(from).setZone(timezone)
    : DateTime.now().setZone(timezone);
  let endDate = to
    ? DateTime.fromISO(to).setZone(timezone)
    : DateTime.now().setZone(timezone);

  if (timeRangeType === ChartTimeRangeType.Yesterday) {
    startDate = DateTime.now().setZone(timezone).minus({ day: 1 });
    endDate = startDate;
  } else if (timeRangeType === ChartTimeRangeType.Today) {
    startDate = DateTime.now().setZone(timezone);
    endDate = startDate;
  } else if (timeRangeType === ChartTimeRangeType["30D"]) {
    startDate = DateTime.now().setZone(timezone).minus({ days: 30 });
    endDate = DateTime.now().setZone(timezone);
  } else if (timeRangeType === ChartTimeRangeType["7D"]) {
    startDate = DateTime.now().setZone(timezone).minus({ days: 7 });
    endDate = DateTime.now().setZone(timezone);
  } else if (timeRangeType === ChartTimeRangeType["3M"]) {
    startDate = DateTime.now().setZone(timezone).minus({ months: 3 });
    endDate = DateTime.now().setZone(timezone);
  } else if (timeRangeType === ChartTimeRangeType["6M"]) {
    startDate = DateTime.now().setZone(timezone).minus({ months: 6 });
    endDate = DateTime.now().setZone(timezone);
  } else if (timeRangeType === ChartTimeRangeType["12M"]) {
    startDate = DateTime.now().minus({ months: 12 });
    endDate = DateTime.now().setZone(timezone);
  }

  if (lineChartGroupByTimeType === LineChartGroupByTimeType.week) {
    startDate = startDate.startOf("week");
  }

  const dateMap: Record<string, number> = {};
  let idx = 0;
  while (startDate < endDate || startDate.toISODate() === endDate.toISODate()) {
    const lookupValue = `${(lineChartGroupByTimeType ===
    LineChartGroupByTimeType.month
      ? startDate.startOf("month")
      : startDate.startOf("day")
    ).toFormat("yyyy-MM-dd")}${
      lineChartGroupByTimeType === LineChartGroupByTimeType.day
        ? ` 00:00:00`
        : ""
    }`;
    dateHeaders.push({
      label:
        lineChartGroupByTimeType === LineChartGroupByTimeType.month
          ? startDate.toFormat("MMM") // "MMM" for the month abbreviation, e.g., "Jan"
          : startDate.toFormat("MMM d"),
      fullLabel:
        lineChartGroupByTimeType === LineChartGroupByTimeType.month
          ? startDate.toFormat("MMM yyyy") // "MMM yyyy" for "Jan 2024"
          : startDate.toFormat("EEE MMM dd, yyyy"),
      lookupValue,
    });
    const retLabel = !idx ? "<1 Day" : `Day ${idx}`;
    retentionHeaders.push({
      label: retLabel,
      fullLabel: retLabel,
      lookupValue: "" + idx++,
    });
    dateMap[lookupValue] = 0;
    if (lineChartGroupByTimeType === LineChartGroupByTimeType.month) {
      startDate = startDate.plus({ month: 1 });
    } else if (lineChartGroupByTimeType === LineChartGroupByTimeType.week) {
      startDate = startDate.plus({ days: 7 });
    } else {
      startDate = startDate.plus({ day: 1 });
    }
  }

  return { dateHeaders, dateMap, retentionHeaders };
};
