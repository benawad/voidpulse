import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const deleteChart = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      chartId: z.string(),
    })
  )
  .mutation(async ({ input: { projectId, chartId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    await db
      .delete(charts)
      .where(and(eq(charts.id, chartId), eq(charts.projectId, projectId)));

    return {
      ok: true,
    };
  });
