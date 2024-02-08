import { z } from "zod";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { eventSchema } from "./insight/eventFilterSchema";
import { ANY_EVENT_VALUE } from "../../app-router-type";

export const getEventPropValues = async (
  propKey: string,
  event: { name: string; value: string },
  projectId: string
) => {
  const resp = await clickhouse.query({
    query: `
  select distinct JSONExtractString(properties, {key:String}) as value
  from events
  where
  ${event.value !== ANY_EVENT_VALUE ? `name = {eventName:String}` : ""}
  and project_id = {projectId:UUID}
  order by value asc
  limit 1500;
`,
    query_params: {
      key: propKey,
      eventName: event.value,
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
      event: eventSchema.optional(),
      propKey: z.string(),
    })
  )
  .query(async ({ input: { projectId, event, propKey }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    return {
      values: event
        ? await getEventPropValues(propKey, event, projectId)
        : await getUserPropValues(propKey, projectId),
    };
  });
