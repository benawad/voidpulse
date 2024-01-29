import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { dateInputRegex } from "../../constants/regex";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";

export const getChartData = protectedProcedure
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
					count() AS count
				FROM events
				WHERE
					projectId = {projectId:UUID}
					AND created_at >= {from:DateTime}
					AND created_at <= {to:DateTime}
					AND name = {eventName:String}
				GROUP BY created_at
				ORDER BY created_at ASC
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

      console.log(data);

      return { data };
    }
  );
