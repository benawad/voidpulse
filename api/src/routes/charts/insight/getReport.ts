import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { charts } from "../../../schema/charts";
import { protectedProcedure } from "../../../trpc";
import { assertProjectMember } from "../../../utils/assertProjectMember";
import {
  queryReport,
  reportInputSchema,
} from "../../../utils/query-metric/queryReport";
import { LRUCache } from "lru-cache";
import stringify from "json-stringify-deterministic";

export type InsightData = { day: string; count: number };

const cache = new LRUCache<string, ReportResult>({
  max: 500,

  // 1 hour
  ttl: 1000 * 60 * 60,

  // return stale items before removing from cache?
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,
});

type ReportResult = Awaited<ReturnType<typeof queryReport>>;

export const getReport = protectedProcedure
  .input(reportInputSchema)
  .query(async ({ input, ctx: { userId } }) => {
    await assertProjectMember({ projectId: input.projectId, userId });

    const key = stringify(input);

    let result = cache.get(key);

    if (!result) {
      result = await queryReport(input);
      if (result.datas.length) {
        cache.set(key, result);
      }
    }

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
