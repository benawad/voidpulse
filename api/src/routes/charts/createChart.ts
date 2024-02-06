import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { metricSchema } from "./insight/eventFilterSchema";
import { db } from "../../db";
import { charts } from "../../schema/charts";
import { boardCharts } from "../../schema/board-charts";
import {
  ChartTimeRangeType,
  ChartType,
  ReportType,
} from "../../app-router-type";
import { dateInputRegex } from "../../constants/regex";

export const chartDataSchema = z.object({
  labels: z.array(z.string()),
  datasets: z.array(
    z.object({
      label: z.string(),
      data: z.array(z.number()),
    })
  ),
});

export const createChart = protectedProcedure
  .input(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      chartType: z.nativeEnum(ChartType),
      reportType: z.nativeEnum(ReportType),
      timeRangeType: z.nativeEnum(ChartTimeRangeType),
      from: z.string().optional(),
      to: z.string().optional(),
      projectId: z.string(),
      boardId: z.string(),
      metrics: z.array(metricSchema),
      data: chartDataSchema,
    })
  )
  .mutation(
    async ({
      input: {
        reportType,
        projectId,
        title,
        boardId,
        data,
        description,
        timeRangeType,
        from,
        to,
        metrics,
        chartType,
      },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      const [chart] = await db
        .insert(charts)
        .values({
          creatorId: userId,
          chartType,
          data,
          metrics,
          boardId,
          title,
          description,
          reportType,
          from,
          to,
          timeRangeType,
        })
        .returning();
      await db.insert(boardCharts).values({ boardId, chartId: chart.id });

      return { chart };
    }
  );
