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
    await assertProjectMember({ projectId, userId });

    const resp = await clickhouse.query({
      query: `
			select distinct name from events where project_id = {projectId: UUID} order by name asc;
		`,
      query_params: {
        projectId,
      },
    });
    const { data } = await resp.json<
      ClickHouseQueryResponse<{ name: string }>
    >();

    return { names: data.map((x) => x.name) };
  });
