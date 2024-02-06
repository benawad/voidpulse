import { z } from "zod";
import {
  DataType,
  FilterAndOr,
  MetricMeasurement,
  PropOrigin,
} from "../../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../../clickhouse";
import { __prod__ } from "../../../constants/prod";
import { dateInputRegex } from "../../../constants/regex";
import { protectedProcedure } from "../../../trpc";
import { assertProjectMember } from "../../../utils/assertProjectMember";
import { filtersToSql } from "../../../utils/filtersToSql";
import {
  InputMetric,
  MetricFilter,
  eventFilterSchema,
  metricSchema,
} from "./eventFilterSchema";

type InsightData = { day: string; count: number };

export const getInsight = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      from: z.string().regex(dateInputRegex),
      to: z.string().regex(dateInputRegex),
      globalFilters: z.array(eventFilterSchema),
      breakdowns: z.array(eventFilterSchema).max(1),
      metrics: z.array(metricSchema),
    })
  )
  .query(
    async ({
      input: { projectId, from, to, metrics, breakdowns },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      return {
        datas: (
          await Promise.all(
            metrics.map((x) =>
              queryMetric({ projectId, from, to, metric: x, breakdowns })
            )
          )
        ).flat(),
      };
    }
  );

const queryMetric = async ({
  projectId,
  from,
  to,
  metric,
  breakdowns,
}: {
  projectId: string;
  from: string;
  to: string;
  breakdowns: MetricFilter[];
  metric: InputMetric;
}) => {
  const { paramMap, whereStrings, paramCount } = filtersToSql(
    metric.filters.filter((x) => x.propOrigin === PropOrigin.event),
    1
  );
  const {
    paramMap: paramMap2,
    whereStrings: userWhereStrings,
    paramCount: paramCount2,
  } = filtersToSql(
    metric.filters.filter((x) => x.propOrigin === PropOrigin.user),
    paramCount
  );
  let breakdownSelect = "";
  if (breakdowns.length) {
    const b = breakdowns[0];
    const jsonExtractor = {
      [DataType.string]: `JSONExtractString`,
      [DataType.number]: `JSONExtractFloat`,
      [DataType.boolean]: `JSONExtractBool`,
      [DataType.date]: `JSONExtractString`,
      [DataType.other]: ``,
    }[b.dataType];
    if (jsonExtractor) {
      paramMap2[`p${paramCount2 + 1}`] = b.propName;
      breakdownSelect = `, ${jsonExtractor}(properties, {p${
        paramCount2 + 1
      }:String}) as breakdown`;
    }
  }
  const whereCombiner = metric.andOr === FilterAndOr.or ? " OR " : " AND ";
  const query = `
  SELECT
      toStartOfDay(time) AS day,
      toInt32(count(${
        metric.type === MetricMeasurement.uniqueUsers
          ? `DISTINCT distinct_id`
          : ``
      })) AS count
      ${breakdownSelect}
  FROM events
  WHERE
    project_id = {projectId:UUID}
    AND time >= {from:DateTime}
    AND time <= {to:DateTime}
    AND name = {eventName:String}
    ${whereStrings.length > 0 ? `AND ${whereStrings.join(whereCombiner)}` : ""}
    ${
      userWhereStrings.length > 0
        ? `AND distinct_id in (
          select distinct_id
          from people as p
          where ${userWhereStrings.join(whereCombiner)})`
        : ""
    }
  GROUP BY day${breakdownSelect ? ", breakdown" : ""}
  ORDER BY day ASC
`;
  if (!__prod__) {
    console.log(query, paramMap, paramMap2);
  }
  const resp = await clickhouse.query({
    query,
    query_params: {
      projectId,
      from,
      to,
      eventName: metric.eventName,
      ...paramMap,
      ...paramMap2,
    },
  });
  const { data } = await resp.json<ClickHouseQueryResponse<InsightData>>();

  if (breakdownSelect) {
    const datas = [];
  } else {
    return [data];
  }
};
