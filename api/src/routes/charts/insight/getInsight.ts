import { z } from "zod";
import { ClickHouseQueryResponse, clickhouse } from "../../../clickhouse";
import { dateInputRegex } from "../../../constants/regex";
import { protectedProcedure } from "../../../trpc";
import { assertProjectMember } from "../../../utils/assertProjectMember";
import { FilterAndOr, MetricMeasurement } from "../../../app-router-type";
import {
  InputMetric,
  eventFilterSchema,
  metricSchema,
} from "./eventFilterSchema";
import { filtersToSql } from "../../../utils/filtersToSql";

type InsightData = { day: string; count: number };

export const getInsight = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      from: z.string().regex(dateInputRegex),
      to: z.string().regex(dateInputRegex),
      globalFilters: z.array(eventFilterSchema),
      breakdowns: z.array(eventFilterSchema),
      metrics: z.array(metricSchema),
    })
  )
  .query(
    async ({
      input: { projectId, from, to, metrics, globalFilters },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      return {
        datas: await Promise.all(
          metrics.map((x) => queryMetric({ projectId, from, to, metric: x }))
        ),
      };
    }
  );

const queryMetric = async ({
  projectId,
  from,
  to,
  metric,
}: {
  projectId: string;
  from: string;
  to: string;
  metric: InputMetric;
}) => {
  const { paramMap, whereStrings } = filtersToSql(metric.filters);
  const whereCombiner = metric.andOr === FilterAndOr.or ? " OR " : " AND ";
  const resp = await clickhouse.query({
    query: `
    SELECT
        toStartOfDay(time) AS day,
        toInt32(count(${
          metric.type === MetricMeasurement.uniqueUsers
            ? `DISTINCT distinct_id`
            : ``
        })) AS count
    FROM events
    WHERE
      project_id = {projectId:UUID}
      AND time >= {from:DateTime}
      AND time <= {to:DateTime}
      AND name = {eventName:String}
      ${
        whereStrings.length > 0 ? `AND ${whereStrings.join(whereCombiner)}` : ""
      }
    GROUP BY day
    ORDER BY day ASC
  `,
    query_params: {
      projectId,
      from,
      to,
      eventName: metric.eventName,
      ...paramMap,
    },
  });
  const { data } = await resp.json<ClickHouseQueryResponse<InsightData>>();

  return data;
};
