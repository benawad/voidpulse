import {
  BreakdownType,
  ChartTimeRangeType,
  FilterAndOr,
  LineChartGroupByTimeType,
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
import { queryFunnelOverTime } from "./queryFunnelOverTime";

export const queryFunnel = async ({
  projectId,
  from,
  to,
  metrics,
  breakdowns,
  timeRangeType,
  globalFilters,
  timezone,
  useWindowLimit = true, // Flag to determine if we should use a window limit
}: {
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  breakdowns: MetricFilter[];
  metrics: InputMetric[];
  timezone: string;
  useWindowLimit?: boolean; // Optional parameter to control window limiting
}) => {
  // Compute windowSize based on from and to dates
  // Using a value approaching UINT32_MAX but leaving margin for safety
  // 2^31 - 1 = 2147483647 (about 68 years in seconds)
  let windowSize = 2147483647;

  // Only compute a limited window size if useWindowLimit is true
  if (useWindowLimit && from && to) {
    try {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Calculate the difference in seconds
      const diffInSeconds = Math.floor(
        (toDate.getTime() - fromDate.getTime()) / 1000
      );

      // Set the window size to a reasonable portion of the total time range
      // Using 20% of the total time range as the window size, with minimums and maximums
      windowSize = Math.max(
        1800, // Minimum window: 30 minutes
        Math.min(
          Math.floor(diffInSeconds * 0.2),
          86400 * 7 // Maximum window: 7 days
        )
      );
    } catch (e) {
      // In case of any errors in date parsing, keep the default large value
      console.error("Error computing windowSize from date strings:", e);
    }
  }
  const paramHandler = new QueryParamHandler();
  const peopleJoin = `inner join people as p on e.distinct_id = p.distinct_id`;
  const breakdownSelect = breakdowns.length
    ? breakdownSelectProperty(breakdowns[0], paramHandler).select
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

  // Create conditions for each metric step
  const funnelConditions = metrics.map((m) => {
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

  // Build the funnel part of the query
  // If useWindowLimit is false, use a different approach for the funnel (without window constraints)
  const funnelQueryPart = useWindowLimit
    ? `windowFunnel({windowSize:UInt32})(
        time,
        ${funnelConditions.map((cond, i) => `${cond} AS step${i + 1}`).join(",\n        ")}
      )`
    : `CASE
        ${metrics
          .map((_, i) => {
            const currentMetrics = metrics.slice(0, i + 1);
            return `WHEN ${currentMetrics.map((_, j) => `max(${funnelConditions[j]}) = 1`).join(" AND ")} THEN ${i + 1}`;
          })
          .join("\n        ")}
        WHEN max(${funnelConditions[0]}) = 1 THEN 1
        ELSE 0
      END`;

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
    countIf(level >= 1) AS step0_reached,
    ${metrics
      .map((_, i) => `countIf(level >= ${i + 2}) AS step${i + 1}_reached`)
      .join(",\n    ")}
  FROM (
    SELECT
      distinct_id,
      ${breakdownSelect ? `${breakdownSelect} AS breakdown,` : ""}
      ${funnelQueryPart} AS level
    FROM events as e
    ${needsPeopleJoin ? peopleJoin : ""}
    WHERE time >= toDate({from:DateTime}) AND time <= toDate({to:DateTime})
    AND e.project_id = {projectId:String}
    AND (
      ${funnelConditions.map((x) => `(${x})`).join(" OR ")}
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
      ${breakdownSelect ? `, breakdown` : ""}
  )
  ${breakdownSelect ? `GROUP BY breakdown` : ""}
  `;

  const resp = await clickhouse.query({
    query,
    query_params: {
      windowSize,
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

    const transformedSteps = stepKeys.map((key, index) => {
      const value = steps[key as keyof typeof steps];
      const percent = index === 0 ? 100 : (value / item["step0_reached"]) * 100;

      return { value, percent: parseFloat(percent.toFixed(2)) }; // Keeping two decimal places for percent
    });

    return {
      breakdown,
      steps: transformedSteps,
    };
  });

  return d;
};
