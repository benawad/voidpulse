import {
  ChartTimeRangeType,
  DateHeader,
  LineChartGroupByTimeType,
} from "../app-router-type";
import {
  startOfWeek,
  startOfMonth,
  subDays,
  subMonths,
  isBefore,
  addDays,
  format,
  startOfDay,
  addMonths,
  addWeeks,
  parseISO,
} from "date-fns";

export const getDateHeaders = (
  timeRangeType: ChartTimeRangeType,
  lineChartGroupByTimeType: LineChartGroupByTimeType,
  from?: string,
  to?: string
) => {
  const dateHeaders: DateHeader[] = [];
  const retentionHeaders: DateHeader[] = [];
  let startDate = from ? new Date(from) : new Date();
  let endDate = to ? new Date(to) : new Date();

  if (timeRangeType === ChartTimeRangeType.Yesterday) {
    startDate = subDays(new Date(), 1);
    endDate = startDate;
  } else if (timeRangeType === ChartTimeRangeType.Today) {
    startDate = new Date();
    endDate = startDate;
  } else if (timeRangeType === ChartTimeRangeType["30D"]) {
    startDate = subDays(new Date(), 30);
    endDate = new Date();
  } else if (timeRangeType === ChartTimeRangeType["7D"]) {
    startDate = subDays(new Date(), 7);
    endDate = new Date();
  } else if (timeRangeType === ChartTimeRangeType["3M"]) {
    startDate = subMonths(new Date(), 3);
    if (lineChartGroupByTimeType === LineChartGroupByTimeType.week) {
      startDate = startOfWeek(startDate, { weekStartsOn: 1 });
    }
    endDate = new Date();
  } else if (timeRangeType === ChartTimeRangeType["6M"]) {
    startDate = subMonths(new Date(), 6);
    if (lineChartGroupByTimeType === LineChartGroupByTimeType.week) {
      startDate = startOfWeek(startDate, { weekStartsOn: 1 });
    }
    endDate = new Date();
  } else if (timeRangeType === ChartTimeRangeType["12M"]) {
    startDate = subMonths(new Date(), 12);
    if (lineChartGroupByTimeType === LineChartGroupByTimeType.week) {
      startDate = startOfWeek(startDate, { weekStartsOn: 1 });
    }
    endDate = new Date();
  }

  const dateMap: Record<string, number> = {};
  let idx = 0;
  while (
    isBefore(startDate, endDate) ||
    startDate.getTime() === endDate.getTime()
  ) {
    const lookupValue = `${format(
      lineChartGroupByTimeType === LineChartGroupByTimeType.month
        ? startOfMonth(startDate)
        : startOfDay(startDate),
      "yyyy-MM-dd"
    )}${
      lineChartGroupByTimeType === LineChartGroupByTimeType.day
        ? ` 00:00:00`
        : ""
    }`;
    dateHeaders.push({
      label:
        lineChartGroupByTimeType === LineChartGroupByTimeType.month
          ? format(startDate, "MMM") // "MMM" for the month abbreviation, e.g., "Jan"
          : format(startDate, "MMM d"),
      fullLabel:
        lineChartGroupByTimeType === LineChartGroupByTimeType.month
          ? format(startDate, "MMM yyyy") // "MMM yyyy" for "Jan 2024"
          : format(startDate, "EEE MMM dd, yyyy"),
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
      startDate = addMonths(startDate, 1);
    } else if (lineChartGroupByTimeType === LineChartGroupByTimeType.week) {
      startDate = addDays(startDate, 7);
    } else {
      startDate = addDays(startDate, 1);
    }
  }

  return { dateHeaders, dateMap, retentionHeaders };
};
