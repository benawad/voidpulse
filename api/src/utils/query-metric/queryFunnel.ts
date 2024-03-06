import {
  BreakdownType,
  ChartTimeRangeType,
  FilterAndOr,
  PropOrigin,
} from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import {
  InputMetric,
  MetricFilter,
} from "../../routes/charts/insight/eventFilterSchema";
import { eventTime, inputTime } from "../eventTime";
import { filtersToSql } from "../filtersToSql";
import { getDateRange } from "../getDateRange";
import { QueryParamHandler } from "./QueryParamHandler";
import { breakdownSelectProperty } from "./breakdownSelectProperty";

/*
sequenceMatch('(?1)')(time, name = 'Event A') AS sequenceA,
sequenceMatch('(?1).*(?2)')(time, name = 'Event A', name = 'Event B') AS sequenceAB,
sequenceMatch('(?1).*(?2).*(?3)')(time, name = 'Event A', name = 'Event B', name = 'Event C') AS sequenceABC
*/

export const queryFunnel = async ({
  projectId,
  from,
  to,
  metrics,
  breakdowns,
  timeRangeType,
  globalFilters,
  timezone,
}: {
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  breakdowns: MetricFilter[];
  metrics: InputMetric[];
  timezone: string;
}) => {
  const paramHandler = new QueryParamHandler();
  const peopleJoin = `inner join people as p on e.distinct_id = p.distinct_id`;
  const breakdownSelect = breakdowns.length
    ? breakdownSelectProperty(breakdowns[0], paramHandler)
    : "";
  const breakdownNeedsPeopleJoin =
    breakdowns.length && breakdowns[0].propOrigin === PropOrigin.user;
  const needsPeopleJoin =
    breakdownNeedsPeopleJoin ||
    globalFilters.some((f) => f.propOrigin === PropOrigin.user) ||
    metrics.some((x) =>
      x.filters.some((f) => f.propOrigin === PropOrigin.user)
    );

  const { whereStrings: globalFilterWhereStrings } = filtersToSql(
    globalFilters,
    paramHandler
  );

  const whereStringsArray = metrics.map((m) => {
    const whereStrings = filtersToSql(m.filters, paramHandler).whereStrings;
    return [
      `name = {${paramHandler.add(m.event.value)}:String}`,
      ...(whereStrings.length
        ? [
            `(${whereStrings.join(
              m.andOr === FilterAndOr.or ? " OR " : " AND "
            )})`,
          ]
        : []),
    ].join(" AND ");
  });
  const sequenceMatchConds = metrics.map(
    (m) => `name = {${paramHandler.add(m.event.value)}:String}`
  );

  const query = `
  ${
    breakdownSelect
      ? `WITH top_breakdown AS (
    SELECT ${breakdownSelect} as breakdown
    FROM events as e
    ${breakdownNeedsPeopleJoin ? peopleJoin : ""}
    WHERE ${eventTime(timezone)} >= ${inputTime("from", timezone)} AND ${eventTime(timezone)} <= ${inputTime("to", timezone)}
    AND e.project_id = {projectId:String}
    GROUP BY breakdown
    ORDER BY COUNT(DISTINCT distinct_id) DESC
    LIMIT 10
  )
  `
      : ``
  }

  SELECT
  ${breakdownSelect ? `breakdown,` : ""}
  toInt32(count(DISTINCT distinct_id)) as step0_reached,
  ${metrics
    .map(
      (_, i) =>
        `toInt32(COUNT(DISTINCT if(step${i}, distinct_id, NULL))) AS step${i}_reached`
    )
    .slice(1)
    .join(",")}
FROM (
  SELECT
      distinct_id,
      ${breakdownSelect ? `max(${breakdownSelect}) AS breakdown,` : ""}
      ${metrics
        .map((_, i) => {
          const currMetrics = metrics.slice(0, i + 1);
          return `sequenceMatch('${currMetrics
            .map((_, k) => `(?${k + 1})`)
            .join(".*")}')(time, ${sequenceMatchConds
            .slice(0, i + 1)
            .join(", ")}) as step${i}`;
        })
        .slice(1)
        .join(",")}
  FROM events as e
  ${needsPeopleJoin ? peopleJoin : ""}
  WHERE time >= toDate({from:DateTime}) AND time <= toDate({to:DateTime})
  AND e.project_id = {projectId:String}
  AND (
  ${whereStringsArray.map((x) => `(${x})`).join(" OR ")}
  )
  ${
    globalFilterWhereStrings.length
      ? `AND ${globalFilterWhereStrings.join(" AND ")}`
      : ""
  }
  ${
    breakdownSelect
      ? `AND ${breakdownSelect} IN (SELECT breakdown FROM top_breakdown)`
      : ""
  }

  GROUP BY
      distinct_id
      )
${
  breakdownSelect
    ? `
GROUP BY breakdown`
    : ""
}
  `;
  const resp = await clickhouse.query({
    query,
    query_params: {
      projectId,
      ...getDateRange({ timeRangeType, timezone, from, to }),
      ...paramHandler.getParams(),
    },
  });
  const { data } = await resp.json<
    ClickHouseQueryResponse<{
      [key: `step${number}_reached`]: number;
      breakdown?: BreakdownType;
    }>
  >();

  const d = data.map((item) => {
    const { breakdown, ...steps } = item;
    const stepKeys = Object.keys(steps).sort(); // Ensure steps are in order
    // let previousValue = 0;

    const transformedSteps = stepKeys.map((key, index) => {
      const value = steps[key as keyof typeof steps];
      const percent = index === 0 ? 100 : (value / item["step0_reached"]) * 100;
      // previousValue = value; // Update previousValue for the next iteration

      return { value, percent: parseFloat(percent.toFixed(2)) }; // Keeping two decimal places for percent
    });

    return {
      breakdown,
      steps: transformedSteps,
    };
  });
  return d;
};
