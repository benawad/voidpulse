import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { metricSchema } from "./getInsight";
import { db } from "../../db";
import { charts } from "../../schema/charts";
import { boardCharts } from "../../schema/board-charts";
import { ChartType } from "../../app-router-type";

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
      type: z.nativeEnum(ChartType),
      projectId: z.string(),
      boardId: z.string(),
      metrics: z.array(metricSchema),
      data: chartDataSchema,
    })
  )
  .mutation(
    async ({
      input: { projectId, title, boardId, data, description, metrics, type },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      const [chart] = await db
        .insert(charts)
        .values({
          creatorId: userId,
          type,
          data,
          metrics,
          boardId,
          title,
          description,
        })
        .returning();
      await db.insert(boardCharts).values({ boardId, chartId: chart.id });

      return { chart };
    }
  );
