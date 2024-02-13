import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { TRPCError } from "@trpc/server";

export const getEventNamesQuery = async (projectId: string) => {
  const resp = await clickhouse.query({
    query: `
    select distinct name
    from events
    where project_id = {projectId:UUID}
    order by name asc limit 1500;
  `,
    query_params: {
      projectId,
    },
  });
  const { data } = await resp.json<ClickHouseQueryResponse<{ name: string }>>();

  return data.map((x) => ({ name: x.name, value: x.name }));
};

export const getEventNames = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input: { projectId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    return {
      items: await getEventNamesQuery(projectId),
    };
  });
