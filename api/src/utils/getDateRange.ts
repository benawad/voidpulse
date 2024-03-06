import { ChartTimeRangeType } from "../app-router-type";
import { startOfDay, endOfDay, subMonths } from "date-fns";
import { DateTime } from "luxon";
import { dateToClickhouseDateString } from "./dateToClickhouseDateString";

export const getDateRange = ({
  timeRangeType,
  timezone,
  from,
  to,
}: {
  timeRangeType: ChartTimeRangeType;
  timezone: string;
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
    const td = DateTime.now().setZone(timezone);
    return {
      from: dateToClickhouseDateString(td.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  } else if (timeRangeType === ChartTimeRangeType.Yesterday) {
    const td = DateTime.now().setZone(timezone).minus({ day: 1 });
    return {
      from: dateToClickhouseDateString(td.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  } else if (timeRangeType === ChartTimeRangeType["7D"]) {
    const td = DateTime.now().setZone(timezone);
    const from = td.minus({ days: 7 });
    return {
      from: dateToClickhouseDateString(from.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  } else if (timeRangeType === ChartTimeRangeType["30D"]) {
    const td = DateTime.now().setZone(timezone);
    const from = td.minus({ days: 30 });
    return {
      from: dateToClickhouseDateString(from.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  } else if (timeRangeType === ChartTimeRangeType["3M"]) {
    const td = DateTime.now().setZone(timezone);
    const from = td.minus({ months: 3 });
    return {
      from: dateToClickhouseDateString(from.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  } else if (timeRangeType === ChartTimeRangeType["6M"]) {
    const td = DateTime.now().setZone(timezone);
    const from = td.minus({ months: 6 });
    return {
      from: dateToClickhouseDateString(from.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  } else if (timeRangeType === ChartTimeRangeType["12M"]) {
    const td = DateTime.now().setZone(timezone);
    const from = td.minus({ months: 12 });
    return {
      from: dateToClickhouseDateString(from.startOf("day").toJSDate()),
      to: dateToClickhouseDateString(td.endOf("day").toJSDate()),
    };
  }

  const str = dateToClickhouseDateString(new Date());
  return {
    from: str,
    to: str,
  };
};
