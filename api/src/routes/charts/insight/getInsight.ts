import { z } from "zod";
import { dateInputRegex } from "../../../constants/regex";
import { protectedProcedure } from "../../../trpc";
import { assertProjectMember } from "../../../utils/assertProjectMember";
import { eventFilterSchema, metricSchema } from "./eventFilterSchema";
import { queryMetric } from "../../../utils/queryMetric";

export type InsightData = { day: string; count: number };

export const getInsight = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      from: z.string().regex(dateInputRegex),
      to: z.string().regex(dateInputRegex),
      globalFilters: z.array(eventFilterSchema),
      breakdowns: z.array(eventFilterSchema).max(1),
      metrics: z.array(metricSchema),
    })
  )
  .query(
    async ({
      input: { projectId, from, to, metrics, breakdowns },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      return {
        datas: (
          await Promise.all(
            metrics.map((x) =>
              queryMetric({ projectId, from, to, metric: x, breakdowns })
            )
          )
        ).flat(),
      };
    }
  );
