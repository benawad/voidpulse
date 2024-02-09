import { MetricMeasurement } from "../../app-router-type";
import { InputMetric } from "../../routes/charts/insight/eventFilterSchema";

export const metricToEventLabel = (metric: InputMetric) => {
  return `${metric.event.name} [${
    {
      [MetricMeasurement.totalEvents]: "Total events",
      [MetricMeasurement.uniqueUsers]: "Unique users",
    }[metric.type]
  }]`;
};
