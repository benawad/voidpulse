import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { charts } from "../../../schema/charts";
import { protectedProcedure } from "../../../trpc";
import { assertProjectMember } from "../../../utils/assertProjectMember";
import {
  queryReport,
  reportInputSchema,
} from "../../../utils/query-metric/queryReport";

export type InsightData = { day: string; count: number };

export const getReport = protectedProcedure
  .input(reportInputSchema)
  .query(async ({ input, ctx: { userId } }) => {
    await assertProjectMember({ projectId: input.projectId, userId });

    const result = await queryReport(input);

    if (!input.chartId) {
      return result;
    }

    // update chart with new data
    db.update(charts)
      .set({
        dataUpdatedAt: new Date(),
        data: result as any,
      })
      .where(and(eq(charts.id, input.chartId), eq(charts.creatorId, userId)))
      .execute();

    return result;
  });
