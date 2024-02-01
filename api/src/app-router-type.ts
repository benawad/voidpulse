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

export enum NumberFilterKey {
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

export enum StringFilterKey {
  is = 1,
  isNot,
  contains,
  notContains,
  isSet,
  isNotSet,
}

export enum DateFilterKey {
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
