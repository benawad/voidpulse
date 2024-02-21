import { z } from "zod";
import { db } from "../../db";
import { boardCharts } from "../../schema/board-charts";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { metricSchema } from "./insight/eventFilterSchema";
import { updateChartDataSchemaFields } from "./updateChart";
import {
  ChartTimeRangeType,
  ChartType,
  ReportType,
} from "../../app-router-type";
import { chartDataSchema } from "./chartDataSchema";

export const createChart = protectedProcedure
  .input(
    z.object({
      ...updateChartDataSchemaFields,
      projectId: z.string(),
      boardId: z.string(),
      metrics: z.array(metricSchema),
      data: chartDataSchema,
    })
  )
  .mutation(
    async ({
      input: {
        chartType = ChartType.line,
        timeRangeType = ChartTimeRangeType["30D"],
        reportType = ReportType.insight,
        projectId,
        boardId,
        ...fields
      },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      const [chart] = await db
        .insert(charts)
        .values({
          creatorId: userId,
          projectId,
          boardId,
          chartType,
          timeRangeType,
          reportType,
          ...fields,
        })
        .returning();
      await db.insert(boardCharts).values({ boardId, chartId: chart.id });

      return { chart };
    }
  );
