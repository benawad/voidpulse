import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";

export const getEventNames = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input: { projectId }, ctx: { userId } }) => {
    console.log("here");
    await assertProjectMember({ projectId, userId });

    try {
      const resp = await clickhouse.query({
        query: `
			select distinct name from events where project_id = {projectId:UUID} order by name asc;
		`,
        query_params: {
          projectId,
        },
      });
      console.log("2");
      const { data } = await resp.json<
        ClickHouseQueryResponse<{ name: string }>
      >();
      console.log("3");

      return { names: data.map((x) => x.name) };
    } catch (e) {
      console.log(e);
      return { names: [] };
    }
  });
