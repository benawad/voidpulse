import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { ClickHouseQueryResponse } from "../../clickhouse";
import { QueryParamHandler } from "../../utils/query-metric/QueryParamHandler";
import { clickhouse } from "../../clickhouse";
import { db } from "../../db";
import { eventPropTypes } from "../../schema/event-prop-types";
import { propsToTypes } from "../../utils/propsToTypes";
import { and, eq } from "drizzle-orm";
import { DataType } from "../../app-router-type";

export const syncProperties = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      eventValue: z.string(),
    })
  )
  .mutation(async ({ input: { projectId, eventValue }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const paramHandler = new QueryParamHandler();
    const query = `
    SELECT
      name,
      properties
    FROM events
    WHERE
      name = {${paramHandler.add(eventValue)}:String}
			and
      project_id = {projectId:UUID}
    ORDER BY time DESC
    LIMIT 1500;
  `;
    const resp = await clickhouse.query({
      query,
      query_params: {
        ...paramHandler.getParams(),
        projectId,
      },
    });
    const { data } =
      await resp.json<
        ClickHouseQueryResponse<{ name: string; properties: string }>
      >();

    let allProps: Record<string, { type: DataType }> = {};

    data.forEach((e) => {
      const types = propsToTypes(JSON.parse(e.properties));
      allProps = {
        ...allProps,
        ...types,
      };
    });

    return db
      .update(eventPropTypes)
      .set({
        propTypes: allProps,
      })
      .where(
        and(
          eq(eventPropTypes.projectId, projectId),
          eq(eventPropTypes.eventValue, eventValue)
        )
      )
      .returning();
  });
