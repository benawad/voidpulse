import { z } from "zod";
import {
  ChartType,
  LineChartGroupByTimeType,
  MetricMeasurement,
  ReportType,
} from "../../app-router-type";

const dateHeaderSchema = z.object({
  label: z.string(),
  fullLabel: z.string(),
  lookupValue: z.string(),
});
const breakdownSchema = z.union([z.string(), z.number()]).optional();

export const chartDataSchema = z.union([
  // funnel
  z.object({
    chartType: z.nativeEnum(ChartType),
    reportType: z.literal(ReportType.funnel),
    labels: z.array(z.string()),
    datas: z.array(
      z.object({
        breakdown: breakdownSchema.optional(),
        steps: z.array(
          z.object({
            value: z.number(),
            percent: z.number(),
          })
        ),
      })
    ),
  }),
  // retention
  z.object({
    chartType: z.nativeEnum(ChartType),
    reportType: z.literal(ReportType.retention),
    retentionHeaders: z.array(dateHeaderSchema),
    datas: z.array(
      z.object({
        id: z.string(),
        eventLabel: z.string(),
        breakdown: breakdownSchema.optional(),
        cohortSize: z.number(),
        averageRetentionByDay: z.record(
          z.object({
            avgRetained: z.number(),
            avgRetainedPercent: z.number(),
          })
        ),
        data: z.record(
          z.object({
            cohortSize: z.number(),
            retentionByDay: z.record(
              z.object({
                breakdown: breakdownSchema.optional(),
                cohort_date: z.string(),
                days_after_cohort: z.number(),
                retained_users: z.number(),
                cohort_size: z.number(),
                retained_users_percent: z.number(),
              })
            ),
          })
        ),
      })
    ),
  }),
  // line
  z.object({
    chartType: z.literal(ChartType.line),
    reportType: z.literal(ReportType.insight),
    dateHeaders: z.array(dateHeaderSchema),
    datas: z.array(
      z.object({
        id: z.string(),
        breakdown: breakdownSchema.optional(),
        eventLabel: z.string(),
        measurement: z.nativeEnum(MetricMeasurement),
        lineChartGroupByTimeType: z
          .nativeEnum(LineChartGroupByTimeType)
          .optional(),
        average_count: z.number(),
        data: z.record(z.number()),
      })
    ),
  }),
  // bar & donut
  z.object({
    chartType: z.union([z.literal(ChartType.bar), z.literal(ChartType.donut)]),
    reportType: z.literal(ReportType.insight),
    datas: z.array(
      z.object({
        id: z.string(),
        eventLabel: z.string(),
        measurement: z.nativeEnum(MetricMeasurement),
        value: z.number(),
        breakdown: breakdownSchema.optional(),
      })
    ),
  }),
]);
