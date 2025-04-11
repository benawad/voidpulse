import { z } from "zod";
import { clickhouse } from "../../clickhouse";
import { protectedProcedure } from "../../trpc";

export const getEventsForUser = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      distinctId: z.string(),
      offset: z.number().optional(),
    })
  )
  .query(
    async ({ input: { projectId, distinctId, offset }, ctx: { userId } }) => {
      const data = (await (
        await clickhouse.query({
          query: `
				SELECT * FROM events
				WHERE distinct_id = {distinctId:String}
				ORDER BY time DESC
				LIMIT 101
				${offset ? `OFFSET ${offset}` : ""}
			`,
          query_params: {
            distinctId,
            ...(offset ? { offset } : {}),
          },
        })
      ).json()) as {
        data: {
          distinct_id: string;
          name: string;
          properties: string;
          time: string;
        }[];
      };

      return {
        events: data.data.slice(0, 100),
        hasMore: data.data.length === 101,
        offset: offset || 0,
      };
    }
  );
