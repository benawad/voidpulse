import { z } from "zod";
import {
  LineChartGroupByTimeType,
  ReportType,
  ChartType,
  ChartTimeRangeType,
} from "../../app-router-type";
import { dateInputRegex } from "../../constants/regex";
import {
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

export const reportInputSchema = z.object({
  chartId: z.string().optional(),
  projectId: z.string(),
  from: z.string().regex(dateInputRegex).optional(),
  to: z.string().regex(dateInputRegex).optional(),
  lineChartGroupByTimeType: z.nativeEnum(LineChartGroupByTimeType).optional(),
  reportType: z.nativeEnum(ReportType),
  chartType: z.nativeEnum(ChartType),
  timeRangeType: z.nativeEnum(ChartTimeRangeType),
  globalFilters: z.array(eventFilterSchema),
  breakdowns: z.array(eventFilterSchema).max(1),
  metrics: z.array(metricSchema),
});

export const queryReport = async ({
  projectId,
  from,
  to,
  metrics,
  breakdowns,
  chartType,
  reportType,
  timeRangeType,
  lineChartGroupByTimeType = LineChartGroupByTimeType.day,
  globalFilters,
}: z.infer<typeof reportInputSchema>) => {
  const project = await getProject(projectId);
  const { dateHeaders, dateMap, retentionHeaders } = getDateHeaders(
    timeRangeType,
    lineChartGroupByTimeType,
    from,
    to
  );

  if (!project) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  if (ReportType.funnel === reportType) {
    return {
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

  if (chartType !== ChartType.line) {
    return {
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

  return {
    reportType,
    chartType,
    dateHeaders,
    datas: (
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
            lineChartGroupByTimeType,
            timezone: project.timezone,
          })
        )
      )
    ).flat(),
  };
};
