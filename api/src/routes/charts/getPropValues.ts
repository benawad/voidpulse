import { z } from "zod";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const getEventPropValues = async (
  propKey: string,
  eventName: string,
  projectId: string
) => {
  const resp = await clickhouse.query({
    query: `
  select distinct JSONExtractString(properties, {key:String}) as value
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

  return data.map((x) => x.value);
};

export const getUserPropValues = async (propKey: string, projectId: string) => {
  const resp = await clickhouse.query({
    query: `
  select distinct JSONExtractString(properties, {key:String}) as value
  from people
  where project_id = {projectId:UUID}
  order by value asc
  limit 1500;
`,
    query_params: {
      key: propKey,
      projectId,
    },
  });
  const { data } = await resp.json<
    ClickHouseQueryResponse<{ value: string }>
  >();

  return data.map((x) => x.value);
};

export const getPropValues = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      eventName: z.string().optional(),
      propKey: z.string(),
    })
  )
  .query(
    async ({ input: { projectId, eventName, propKey }, ctx: { userId } }) => {
      await assertProjectMember({ projectId, userId });

      return {
        values: eventName
          ? await getEventPropValues(propKey, eventName, projectId)
          : await getUserPropValues(propKey, projectId),
      };
    }
  );
