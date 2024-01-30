import { z } from "zod";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { dateInputRegex } from "../../constants/regex";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const getInsight = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      from: z.string().regex(dateInputRegex),
      to: z.string().regex(dateInputRegex),
      eventName: z.string(),
    })
  )
  .query(
    async ({ input: { projectId, from, to, eventName }, ctx: { userId } }) => {
      await assertProjectMember({ projectId, userId });

      const resp = await clickhouse.query({
        query: `
				SELECT
            toStartOfDay(created_at) AS day,
            toInt32(count()) AS count
        FROM events
        WHERE
          project_id = {projectId:UUID}
          AND created_at >= {from:DateTime}
          AND created_at <= {to:DateTime}
          AND name = {eventName:String}
        GROUP BY day
        ORDER BY day ASC
			`,
        query_params: {
          projectId,
          from,
          to,
          eventName,
        },
      });
      const { data } = await resp.json<
        ClickHouseQueryResponse<{ day: string; count: number }>
      >();
      return { data };
    }
  );
