import { z } from "zod";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const getPropValues = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      eventName: z.string(),
      propKey: z.string(),
    })
  )
  .query(
    async ({ input: { projectId, eventName, propKey }, ctx: { userId } }) => {
      await assertProjectMember({ projectId, userId });

      const resp = await clickhouse.query({
        query: `
			select distinct tupleElement(properties, {key:String}) as value
			from events
			where name = {eventName:String} and project_id = {projectId:UUID}
			order by value asc
			limit 1500;
		`,
        query_params: {
          key: propKey,
          eventName,
          projectId,
        },
      });
      const { data } = await resp.json<
        ClickHouseQueryResponse<{ value: string }>
      >();

      return { values: data.map((x) => x.value) };
    }
  );

/*
seed DATA
INSERT INTO sensor_values
SELECT *
FROM generateRandom('timestamp DateTime, site_id UInt8, event VARCHAR, uuid UUID, metric_value Int32', NULL, 10)
LIMIT 200000000
*/
