import { AggType, MetricMeasurement } from "../../app-router-type";
import { InputMetric } from "../../routes/charts/insight/eventFilterSchema";

export const metricToEventLabel = (metric: InputMetric) => {
  return `${metric.event.name} [${
    {
      [MetricMeasurement.totalEvents]: "Total events",
      [MetricMeasurement.uniqueUsers]: "Unique users",
      [MetricMeasurement.frequencyPerUser]: {
        [AggType.avg]: "Average Frequency per user",
        [AggType.median]: "Median Frequency per user",
        [AggType.percentile25]: "P25 Frequency per user",
        [AggType.percentile75]: "P75 Frequency per user",
        [AggType.percentile90]: "P90 Frequency per user",
        [AggType.min]: "Min Frequency per user",
        [AggType.max]: "Max Frequency per user",
      }[metric.typeAgg || AggType.avg],
      [MetricMeasurement.aggProp]: `${
        {
          [AggType.avg]: "Average",
          [AggType.median]: "Median",
          [AggType.percentile25]: "P25",
          [AggType.percentile75]: "P75",
          [AggType.percentile90]: "P90",
          [AggType.min]: "Min",
          [AggType.max]: "Max",
        }[metric.typeAgg || AggType.avg]
      } ${metric.typeProp?.name}`,
    }[metric.type || MetricMeasurement.uniqueUsers]
  }]`;
};
