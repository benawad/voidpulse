import { z } from "zod";
import {
  ChartType,
  LineChartGroupByTimeType,
  LtvType,
  LtvWindowType,
  MetricMeasurement,
  ReportType,
} from "../../app-router-type";

const dateHeaderSchema = z.object({
  label: z.string(),
  fullLabel: z.string(),
  lookupValue: z.string(),
});
const breakdownSchema = z.union([z.string(), z.number()]).optional();

const lineDatas = z.array(
  z.object({
    id: z.string(),
    breakdown: breakdownSchema.optional(),
    tableOnly: z.boolean().optional(),
    eventLabel: z.string(),
    measurement: z.nativeEnum(MetricMeasurement),
    lineChartGroupByTimeType: z.nativeEnum(LineChartGroupByTimeType).optional(),
    fbCampaignIds: z.array(z.string()).optional(),
    customLabel: z.string().optional(),
    average_count: z.number(),
    data: z.record(z.number()),
  })
);

export const ltvDataSchema = z.object({
  reportType: z.literal(ReportType.ltv),
  chartType: z.nativeEnum(ChartType),
  dateHeaders: z.array(dateHeaderSchema),
  ltvType: z.nativeEnum(LtvType).optional().nullable(),
  ltvWindowType: z.nativeEnum(LtvWindowType).optional().nullable(),
  datas: z.array(
    z.object({
      id: z.string(),
      tableOnly: z.boolean().optional(),
      breakdown: breakdownSchema.optional(),
      eventLabel: z.string(),
      lineChartGroupByTimeType: z
        .nativeEnum(LineChartGroupByTimeType)
        .optional(),
      average_count: z.number(),
      data: z.record(z.number()),
    })
  ),
});

export const chartDataSchema = z.union([
  // funnel
  z.object({
    reportType: z.literal(ReportType.funnel),
    chartType: z.nativeEnum(ChartType),
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
  // funnel over time
  z.object({
    dateHeaders: z.array(dateHeaderSchema),
    reportType: z.literal(ReportType.funnel),
    chartType: z.nativeEnum(ChartType),
    labels: z.array(z.string()),
    lineChartGroupByTimeType: z.nativeEnum(LineChartGroupByTimeType).optional(),
    isOverTime: z.boolean().optional(),
    datas: lineDatas,
  }),
  // retention
  z.object({
    reportType: z.literal(ReportType.retention),
    chartType: z.nativeEnum(ChartType),
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
  // ltv
  ltvDataSchema,
  // line
  z.object({
    reportType: z.literal(ReportType.insight),
    chartType: z.literal(ChartType.line),
    dateHeaders: z.array(dateHeaderSchema),
    datas: lineDatas,
  }),
  // bar & donut
  z.object({
    reportType: z.literal(ReportType.insight),
    chartType: z.union([z.literal(ChartType.bar), z.literal(ChartType.donut)]),
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
