import { eq } from "drizzle-orm";
import { z } from "zod";
import { ANY_EVENT_VALUE, DataType, PropOrigin } from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { __prod__ } from "../../constants/prod";
import { db } from "../../db";
import { peoplePropTypes } from "../../schema/people-prop-types";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { propsToTypes } from "../../utils/propsToTypes";
import { eventSchema } from "./insight/eventFilterSchema";
import { QueryParamHandler } from "../../utils/query-metric/QueryParamHandler";

export const getPropKeys = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      events: z.array(eventSchema),
    })
  )
  .query(async ({ input: { projectId, events }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const peoplePropTypePromise = db.query.peoplePropTypes
      .findFirst({
        where: eq(peoplePropTypes.projectId, projectId),
      })
      .execute();

    let propDefs: Record<string, { type: DataType }> = {};

    const paramHandler = new QueryParamHandler();
    const querySpecificEvents = !!(
      events.length && events.some((e) => e.value !== ANY_EVENT_VALUE)
    );
    const query = `
    SELECT
      name,
      any(properties) AS properties
    FROM events
    WHERE
      ${querySpecificEvents ? `name IN (${events.map((e) => `{${paramHandler.add(e.value)}:String}`)}) AND` : ""}
      project_id = {projectId:UUID}
    GROUP BY name
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
      await resp.json<ClickHouseQueryResponse<{ properties: string }>>();

    data.map((x) => {
      try {
        propDefs = {
          ...propDefs,
          ...propsToTypes(JSON.parse(x.properties)),
        };
      } catch (err) {
        if (!__prod__) {
          console.log(data);
          console.log(x);
          console.log(err);
        }
      }
    });

    const userPropTypes = await peoplePropTypePromise;

    return {
      propDefs: [
        ...Object.entries(propDefs).map(([key, value]) => ({
          key,
          type: value.type,
          propOrigin: PropOrigin.event,
        })),
        ...(userPropTypes?.propTypes
          ? Object.entries(userPropTypes.propTypes).map(([key, value]) => ({
              key,
              type: value.type as DataType,
              propOrigin: PropOrigin.user,
            }))
          : []),
      ],
    };
  });
