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
