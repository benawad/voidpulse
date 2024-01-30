import { appRouter } from "./appRouter";

export type AppRouter = typeof appRouter;

export enum MetricMeasurement {
  uniqueUsers = 1,
  totalEvents,
}
