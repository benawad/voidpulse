import { z } from "zod";
import {
  LineChartGroupByTimeType,
  ReportType,
  ChartType,
  ChartTimeRangeType,
  NumOperation,
  MetricMeasurement,
  LtvType,
  LtvWindowType,
} from "../../app-router-type";
import { dateInputRegex } from "../../constants/regex";
import {
  eventCombinationSchema,
  eventFilterSchema,
  metricSchema,
} from "../../routes/charts/insight/eventFilterSchema";
import { getDateHeaders } from "../getDateHeaders";
import { queryBarChartMetric } from "./queryBarChartMetric";
import { queryFunnel } from "./queryFunnel";
import { queryLineChartMetric } from "./queryLineChartMetric";
import { queryRetention } from "./queryRetention";
import { getProject } from "../cache/getProject";
import { TRPCError } from "@trpc/server";
import { v4 } from "uuid";
import { queryLTV } from "./queryLTV";

export const reportInputSchema = z.object({
  noCache: z.boolean().optional(),
  chartId: z.string().optional(),
  projectId: z.string(),
  from: z.string().regex(dateInputRegex).optional(),
  to: z.string().regex(dateInputRegex).optional(),
  lineChartGroupByTimeType: z.nativeEnum(LineChartGroupByTimeType).optional(),
  reportType: z.nativeEnum(ReportType),
  chartType: z.nativeEnum(ChartType),
  ltvType: z.nativeEnum(LtvType).optional().nullable(),
  ltvWindowType: z.nativeEnum(LtvWindowType).optional().nullable(),
  timeRangeType: z.nativeEnum(ChartTimeRangeType),
  globalFilters: z.array(eventFilterSchema),
  breakdowns: z.array(eventFilterSchema).max(1),
  metrics: z.array(metricSchema),
  combinations: z.array(eventCombinationSchema).optional(),
});

export const queryReport = async ({
  projectId,
  from,
  to,
  metrics,
  breakdowns,
  combinations,
  chartType,
  reportType,
  ltvType,
  ltvWindowType,
  timeRangeType,
  lineChartGroupByTimeType = LineChartGroupByTimeType.day,
  globalFilters,
}: z.infer<typeof reportInputSchema>) => {
  const project = await getProject(projectId);

  if (!project) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  const { dateHeaders, dateMap, retentionHeaders } = getDateHeaders(
    timeRangeType,
    ReportType.retention === reportType
      ? LineChartGroupByTimeType.day
      : lineChartGroupByTimeType,
    project.timezone,
    from,
    to
  );

  if (ReportType.funnel === reportType) {
    return {
      computedAt: new Date(),
      reportType,
      chartType,
      labels: metrics.map((x, i) => `${i + 1} ${x.event.name}`),
      datas:
        metrics.length < 2
          ? []
          : await queryFunnel({
              projectId,
              from,
              to,
              metrics,
              globalFilters,
              breakdowns,
              timeRangeType,
              timezone: project.timezone,
            }),
    };
  }

  if (ReportType.retention === reportType) {
    return {
      computedAt: new Date(),
      reportType,
      chartType,
      retentionHeaders,
      datas:
        metrics.length !== 2
          ? []
          : await queryRetention({
              projectId,
              from,
              to,
              metrics,
              globalFilters,
              breakdowns,
              timeRangeType,
              timezone: project.timezone,
            }),
    };
  }

  if (ReportType.ltv === reportType) {
    return {
      computedAt: new Date(),
      reportType,
      chartType,
      ltvType,
      dateHeaders,
      datas: (
        await queryLTV({
          dateHeaders,
          projectId,
          dateMap,
          from,
          to,
          metrics,
          globalFilters,
          ltvType,
          breakdowns,
          lineChartGroupByTimeType,
          ltvWindowType,
          timeRangeType,
          timezone: project.timezone,
        })
      ).flat(),
    };
  }

  if (chartType !== ChartType.line) {
    return {
      computedAt: new Date(),
      reportType,
      chartType,
      datas: (
        await Promise.all(
          metrics.map((x) =>
            queryBarChartMetric({
              projectId,
              from,
              to,
              metric: x,
              globalFilters,
              breakdowns,
              timeRangeType,
              timezone: project.timezone,
            })
          )
        )
      ).flat(),
    };
  }

  let datas = (
    await Promise.all(
      metrics.map((x) =>
        queryLineChartMetric({
          dateMap,
          dateHeaders,
          projectId,
          from,
          to,
          metric: x,
          globalFilters,
          breakdowns,
          timeRangeType,
          combinations,
          lineChartGroupByTimeType,
          timezone: project.timezone,
        })
      )
    )
  ).flat();

  if (combinations?.length) {
    const { eventIdx1, eventIdx2, operation } = combinations[0];
    const event1 = datas[eventIdx1];
    const event2 = datas[eventIdx2];
    datas = datas.filter((_, i) => i !== eventIdx1 && i !== eventIdx2);
    let count = 0;
    let sum = 0;
    const newData: Record<string, number> = {};
    const keys = new Set([
      ...Object.keys(event1.data),
      ...Object.keys(event2.data),
    ]);
    for (const key of keys) {
      const v1 = event1.data[key] || 0;
      const v2 = event2.data[key] || 0;
      if (operation === NumOperation.multiply) {
        newData[key] = v1 * v2;
      } else if (v2) {
        newData[key] = v1 / v2;
      } else {
        newData[key] = 0;
      }
      count++;
      sum += newData[key] ?? 0;
    }
    datas.push({
      id: v4(),
      eventLabel: `${event1.eventLabel} ${operation === NumOperation.multiply ? "*" : "/"} ${event2.eventLabel}`,
      measurement: MetricMeasurement.uniqueUsers,
      average_count: sum / count,
      data: newData,
    });
  }

  return {
    computedAt: new Date(),
    reportType,
    chartType,
    dateHeaders,
    datas,
  };
};
