import { z } from "zod";
import { dateInputRegex } from "../../../constants/regex";
import { protectedProcedure } from "../../../trpc";
import { assertProjectMember } from "../../../utils/assertProjectMember";
import { eventFilterSchema, metricSchema } from "./eventFilterSchema";
import { queryLineChartMetric } from "../../../utils/query-metric/queryLineChartMetric";
import {
  ChartTimeRangeType,
  ChartType,
  LineChartGroupByTimeType,
} from "../../../app-router-type";
import { getDateHeaders } from "../../../utils/getDateHeaders";
import { queryBarChartMetric } from "../../../utils/query-metric/queryBarChartMetric";

export type InsightData = { day: string; count: number };

export const getInsight = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      from: z.string().regex(dateInputRegex).optional(),
      to: z.string().regex(dateInputRegex).optional(),
      lineChartGroupByTimeType: z
        .nativeEnum(LineChartGroupByTimeType)
        .optional(),
      chartType: z.nativeEnum(ChartType),
      timeRangeType: z.nativeEnum(ChartTimeRangeType),
      globalFilters: z.array(eventFilterSchema),
      breakdowns: z.array(eventFilterSchema).max(1),
      metrics: z.array(metricSchema),
    })
  )
  .query(
    async ({
      input: {
        projectId,
        from,
        to,
        metrics,
        breakdowns,
        chartType,
        timeRangeType,
        lineChartGroupByTimeType = LineChartGroupByTimeType.day,
        globalFilters,
      },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      const { dateHeaders, dateMap } = getDateHeaders(
        timeRangeType,
        lineChartGroupByTimeType,
        from,
        to
      );

      if (chartType !== ChartType.line) {
        return {
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
                })
              )
            )
          ).flat(),
        };
      }

      return {
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
              })
            )
          )
        ).flat(),
      };
    }
  );
