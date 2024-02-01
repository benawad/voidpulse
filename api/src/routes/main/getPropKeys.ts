import { z } from "zod";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { DataType } from "../../app-router-type";
import { isStringDate } from "../../utils/isStringDate";

export const getPropKeys = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      eventName: z.string(),
    })
  )
  .query(async ({ input: { projectId, eventName }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const resp = await clickhouse.query({
      query: `
			select properties
			from events
			where name = {eventName:String} and project_id = {projectId:UUID}
			order by value asc
			limit 5;
		`,
      query_params: {
        eventName,
        projectId,
      },
    });
    const { data } = await resp.json<
      ClickHouseQueryResponse<{ properties: string }>
    >();

    const propDefs: Record<string, { type: DataType }> = {};

    data.map((x) => {
      try {
        Object.entries(JSON.parse(x.properties)).forEach(([key, value]) => {
          if (!(key in propDefs)) {
            if (typeof value === "number") {
              propDefs[key] = { type: DataType.number };
            } else if (typeof value === "string") {
              if (isStringDate(value)) {
                propDefs[key] = { type: DataType.date };
              } else {
                propDefs[key] = { type: DataType.string };
              }
            } else if (typeof value === "boolean") {
              propDefs[key] = { type: DataType.boolean };
            } else {
              propDefs[key] = { type: DataType.other };
            }
          }
        });
      } catch {}
    });

    return { propDefs };
  });
