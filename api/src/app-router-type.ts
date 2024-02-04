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
  last = 1,
  notInTheLast,
  between,
  notBetween,
  on,
  notOn,
  beforeTheLast,
  before,
  since,
  inTheNext,
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
