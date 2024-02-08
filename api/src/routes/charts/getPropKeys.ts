import { eq } from "drizzle-orm";
import { z } from "zod";
import { DataType, PropOrigin } from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { __prod__ } from "../../constants/prod";
import { db } from "../../db";
import { peoplePropTypes } from "../../schema/people-prop-types";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { propsToTypes } from "../../utils/propsToTypes";

export const getPropKeys = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      eventName: z.string().optional(),
    })
  )
  .query(async ({ input: { projectId, eventName }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const peoplePropTypePromise = db.query.peoplePropTypes.findFirst({
      where: eq(peoplePropTypes.projectId, projectId),
    });

    let propDefs: Record<string, { type: DataType }> = {};

    if (eventName) {
      const resp = await clickhouse.query({
        query: `
			select properties
			from events
			where name = {eventName:String} and project_id = {projectId:UUID}
			limit 3;
		`,
        query_params: {
          eventName,
          projectId,
        },
      });
      const { data } = await resp.json<
        ClickHouseQueryResponse<{ properties: string }>
      >();

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
    }

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
