import { ChartTimeRangeType } from "../app-router-type";
import { startOfDay, endOfDay, subMonths } from "date-fns";
import { dateToClickhouseDateString } from "./dateToClickhouseDateString";

export const getDateRange = ({
  timeRangeType,
  from,
  to,
}: {
  timeRangeType: ChartTimeRangeType;
  from?: string;
  to?: string;
}) => {
  if (timeRangeType === ChartTimeRangeType.Custom) {
    if (from && to) {
      return { from, to };
    }
    const str = dateToClickhouseDateString(new Date());
    return {
      from: str,
      to: str,
    };
  } else if (timeRangeType === ChartTimeRangeType.Today) {
    const today = new Date();
    return {
      from: dateToClickhouseDateString(startOfDay(today)),
      to: dateToClickhouseDateString(endOfDay(today)),
    };
  } else if (timeRangeType === ChartTimeRangeType.Yesterday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      from: dateToClickhouseDateString(startOfDay(yesterday)),
      to: dateToClickhouseDateString(endOfDay(yesterday)),
    };
  } else if (timeRangeType === ChartTimeRangeType["7D"]) {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    return {
      from: dateToClickhouseDateString(startOfDay(from)),
      to: dateToClickhouseDateString(endOfDay(today)),
    };
  } else if (timeRangeType === ChartTimeRangeType["30D"]) {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 30);
    return {
      from: dateToClickhouseDateString(startOfDay(from)),
      to: dateToClickhouseDateString(endOfDay(today)),
    };
  } else if (timeRangeType === ChartTimeRangeType["3M"]) {
    const today = new Date();
    const from = subMonths(new Date(today), 3);
    return {
      from: dateToClickhouseDateString(startOfDay(from)),
      to: dateToClickhouseDateString(endOfDay(today)),
    };
  } else if (timeRangeType === ChartTimeRangeType["6M"]) {
    const today = new Date();
    const from = subMonths(new Date(today), 6);
    return {
      from: dateToClickhouseDateString(startOfDay(from)),
      to: dateToClickhouseDateString(endOfDay(today)),
    };
  } else if (timeRangeType === ChartTimeRangeType["12M"]) {
    const today = new Date();
    const from = subMonths(new Date(today), 12);
    return {
      from: dateToClickhouseDateString(startOfDay(from)),
      to: dateToClickhouseDateString(endOfDay(today)),
    };
  }

  const str = dateToClickhouseDateString(new Date());
  return {
    from: str,
    to: str,
  };
};
