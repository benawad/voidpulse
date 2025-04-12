import {
  BreakdownType,
  ChartTimeRangeType,
  FilterAndOr,
  LineChartGroupByTimeType,
  PropOrigin,
  MetricMeasurement,
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
import { v4 } from "uuid";

type BreakdownData = {
  id: string;
  eventLabel: string;
  measurement: MetricMeasurement;
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
  breakdown?: BreakdownType;
  average_count: number;
  data: Record<string, number>;
};

export const queryFunnelOverTime = async ({
  projectId,
  from,
  to,
  metrics,
  breakdowns,
  timeRangeType,
  globalFilters,
  timezone,
  lineChartGroupByTimeType = LineChartGroupByTimeType.day,
  dateMap,
  dateHeaders,
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
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
  dateMap: Record<string, number>;
  dateHeaders: Array<{
    label: string;
    lookupValue: string;
  }>;
  useWindowLimit?: boolean; // Optional parameter to control window limiting
}): Promise<BreakdownData[]> => {
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

  WITH user_funnel AS (
    -- First calculate the funnel completion for each user overall
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
  ),

  first_touch AS (
    -- Find the first touch time for each user for the first event in the funnel
    SELECT
      distinct_id,
      ${breakdownSelect ? `${breakdownSelect} AS breakdown,` : ""}
      min(${eventTime(timezone)}) AS first_event_time
    FROM events as e
    ${needsPeopleJoin ? peopleJoin : ""}
    WHERE time >= toDate({from:DateTime}) AND time <= toDate({to:DateTime})
    AND e.project_id = {projectId:String}
    AND (${funnelConditions[0]})
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

  SELECT
    ${
      {
        [LineChartGroupByTimeType.day]: "toStartOfDay",
        [LineChartGroupByTimeType.week]: "toStartOfWeek",
        [LineChartGroupByTimeType.month]: "toStartOfMonth",
      }[lineChartGroupByTimeType]
    }(ft.first_event_time${
      lineChartGroupByTimeType === LineChartGroupByTimeType.week ? `, 1` : ""
    }) AS day,
    ${breakdownSelect ? `ft.breakdown,` : ""}
    count(DISTINCT ft.distinct_id) AS step0_reached,
    count(DISTINCT if(uf.level >= ${metrics.length}, uf.distinct_id, NULL)) AS step${metrics.length - 1}_reached
  FROM first_touch ft
  LEFT JOIN user_funnel uf ON ft.distinct_id = uf.distinct_id
    ${breakdownSelect ? `AND ft.breakdown = uf.breakdown` : ""}
  GROUP BY day${breakdownSelect ? `, breakdown` : ""}
  ORDER BY day ASC
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
      day: string;
      [key: `step${number}_reached`]: string;
      breakdown?: BreakdownType;
    }>
  >();

  if (!data.length) {
    return [];
  }

  if (breakdownSelect) {
    const breakdownMap = new Map<string, Record<string, number>>();
    const breakdownCounts = new Map<string, number>();

    data.forEach((item) => {
      const breakdown = item.breakdown as string;
      if (!breakdownMap.has(breakdown)) {
        breakdownMap.set(breakdown, {});
        breakdownCounts.set(breakdown, 0);
      }

      const dataMap = breakdownMap.get(breakdown)!;
      const value = parseInt(item[`step${metrics.length - 1}_reached`]);
      dataMap[item.day] = value;
      breakdownCounts.set(breakdown, breakdownCounts.get(breakdown)! + value);
    });

    return Array.from(breakdownMap.entries()).map(([breakdown, dataMap]) => ({
      id: v4(),
      eventLabel: `${metrics[0].event.value} → ${metrics[metrics.length - 1].event.value}`,
      measurement: MetricMeasurement.uniqueUsers,
      lineChartGroupByTimeType,
      breakdown,
      average_count:
        Math.round(
          (10 * breakdownCounts.get(breakdown)!) / dateHeaders.length
        ) / 10,
      data: {
        ...dateMap,
        ...dataMap,
      },
    }));
  } else {
    const dataMap: Record<string, number> = {};
    let totalCount = 0;

    data.forEach((item) => {
      const value1 = parseInt(item[`step0_reached`]);
      const value2 = parseInt(item[`step${metrics.length - 1}_reached`]);
      const percentage = Math.round((1000 * value2) / value1) / 10;
      dataMap[item.day] = percentage;
      totalCount += percentage;
    });

    return [
      {
        id: v4(),
        eventLabel: `${metrics[0].event.value} → ${metrics[metrics.length - 1].event.value}`,
        measurement: MetricMeasurement.uniqueUsers,
        lineChartGroupByTimeType,
        average_count: Math.round((10 * totalCount) / dateHeaders.length) / 10,
        data: {
          ...dateMap,
          ...dataMap,
        },
      },
    ];
  }
};
