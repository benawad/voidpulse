import { appRouter } from "./appRouter";

export type AppRouter = typeof appRouter;

export enum MetricMeasurement {
  uniqueUsers = 1,
  totalEvents,
}

export enum DataType {
  string = 1,
  number,
  boolean,
  date,
  other,
}

export enum NumberFilterOperation {
  equals = 1,
  notEqual,
  greaterThan,
  greaterThanOrEqual,
  lessThan,
  lessThanOrEqual,
  between,
  notBetween,
  isNumeric,
  isNotNumeric,
}

export enum StringFilterOperation {
  is = 1,
  isNot,
  contains,
  notContains,
  isSet,
  isNotSet,
}

export enum DateFilterOperation {
  between = 1,
  notBetween,
  on,
  notOn,
  before,
  since,
  // beforeTheLast,
  // last,
  // notInTheLast,
  // inTheNext,
}

export enum FilterAndOr {
  and = 1,
  or,
}

export enum PropOrigin {
  event = 1,
  user,
}

export enum ChartType {
  line = 1,
  donut,
  bar,
}

export enum ReportType {
  insight = 1,
  funnel,
  retention,
  flow,
}

export enum ChartTimeRangeType {
  "Custom" = 1,
  "Today",
  "Yesterday",
  "7D",
  "30D",
  "3M",
  "6M",
  "12M",
}

export enum LineChartGroupByTimeType {
  day = 1,
  week,
  month,
}

export type DateHeader = {
  label: string;
  fullLabel: string;
  lookupValue: string;
};

export const ANY_EVENT_VALUE = "$*";

export enum RetentionNumFormat {
  percent = 1,
  rawCount,
}

export enum ThemeId {
  default = 1,
}
