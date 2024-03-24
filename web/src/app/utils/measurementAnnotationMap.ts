import { MetricMeasurement } from "@voidpulse/api";

export const measurementAnnotationMap = {
  [MetricMeasurement.totalEvents]: "events",
  [MetricMeasurement.uniqueUsers]: "users",
  [MetricMeasurement.frequencyPerUser]: "events per user",
  [MetricMeasurement.aggProp]: "",
};
