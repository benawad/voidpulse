import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { boardCharts } from "../../schema/board-charts";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const getCharts = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      boardId: z.string(),
    })
  )
  .query(async ({ input: { projectId, boardId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const data = await db
      .select()
      .from(charts)
      .innerJoin(boardCharts, eq(charts.id, boardCharts.chartId))
      .where(eq(boardCharts.boardId, boardId));

    return {
      charts: data.map((x) => x.charts),
    };
  });
