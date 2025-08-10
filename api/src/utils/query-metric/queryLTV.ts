import { v4 } from "uuid";
import {
  ANY_EVENT_VALUE,
  ChartTimeRangeType,
  DateHeader,
  FilterAndOr,
  LineChartGroupByTimeType,
  LtvType,
  LtvWindowType,
  MetricMeasurement,
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
import { breakdownSelectProperty } from "./breakdownSelectProperty";
import { QueryParamHandler } from "./QueryParamHandler";

export const queryLTV = async ({
  projectId,
  from,
  to,
  timeRangeType,
  metrics,
  breakdowns,
  globalFilters,
  timezone,
  lineChartGroupByTimeType = LineChartGroupByTimeType.day,
  ltvType = LtvType.payingUsers,
  ltvWindowType = LtvWindowType.AllTime,
  dateHeaders,
  dateMap,
}: {
  timezone: string;
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  ltvType?: LtvType | null;
  ltvWindowType?: LtvWindowType | null;
  dateHeaders: DateHeader[];
  dateMap: Record<string, number>;
  timeRangeType: ChartTimeRangeType;
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
  breakdowns: MetricFilter[];
  metrics: InputMetric[];
}) => {
  const paramHandler = new QueryParamHandler();
  const { whereStrings, needsPeopleJoin } = filtersToSql(
    [...metrics[0].filters, ...globalFilters],
    paramHandler
  );
  const whereCombiner = metrics[0].andOr === FilterAndOr.or ? " OR " : " AND ";
  const { whereStrings: whereStrings2, needsPeopleJoin: needsPeopleJoin2 } =
    filtersToSql([...metrics[1].filters, ...globalFilters], paramHandler);
  const whereCombiner2 = metrics[1].andOr === FilterAndOr.or ? " OR " : " AND ";
  const peopleJoin = `inner join people as p on e.distinct_id = p.distinct_id`;
  const firstWhereSection = `${
    needsPeopleJoin ||
    (breakdowns.length && breakdowns[0].propOrigin === PropOrigin.user)
      ? peopleJoin
      : ""
  }
  WHERE ${eventTime(timezone)} >= ${inputTime("from", timezone)} AND ${eventTime(timezone)} <= ${inputTime("to", timezone)}
  ${metrics[0].event.value !== ANY_EVENT_VALUE ? `AND name = {startEventName:String}` : ``} AND e.project_id = {projectId:String}
  ${whereStrings.length ? `AND (${whereStrings.join(whereCombiner)})` : ""}`;
  const breakdownSelect = breakdowns.length
    ? breakdownSelectProperty(breakdowns[0], paramHandler).select
    : "";

  let query = `
  ${
    breakdownSelect
      ? `WITH top_breakdown AS (
      SELECT ${breakdownSelect} as breakdown
      FROM events as e
      ${firstWhereSection}
      GROUP BY breakdown
      ORDER BY COUNT(DISTINCT distinct_id) DESC
      LIMIT 10
  ),`
      : "WITH "
  }
cohort_users AS (
    SELECT
        ${breakdownSelect ? `${breakdownSelect} as breakdown,` : ``}
        distinct_id,
        ${
          {
            [LineChartGroupByTimeType.day]: "toStartOfDay",
            [LineChartGroupByTimeType.week]: "toStartOfWeek",
            [LineChartGroupByTimeType.month]: "toStartOfMonth",
          }[lineChartGroupByTimeType]
        }(
        MIN(${eventTime(timezone)})
        ${
          lineChartGroupByTimeType === LineChartGroupByTimeType.week
            ? `, 1`
            : ""
        }) AS cohort_date,
        MIN(${eventTime(timezone)}) AS start_date
    FROM events as e
    ${firstWhereSection}
    ${breakdownSelect ? `AND breakdown IN (SELECT breakdown FROM top_breakdown)` : ``}
    GROUP BY distinct_id${breakdownSelect ? `, breakdown` : ``}
),
purchase_data AS (
    SELECT
        ${breakdownSelect ? `cu.breakdown,` : ``}
        e.distinct_id,
        cu.cohort_date,
        JSONExtractFloat(e.properties, 'price')/100 as purchase_amount
    FROM events as e
    JOIN cohort_users cu ON e.distinct_id = cu.distinct_id
    WHERE name = {endEventName:String} ${
      {
        [LtvWindowType.NoWindow]: ``,
        [LtvWindowType.d7]: `AND ${eventTime(timezone, "e.")} <= cu.start_date + INTERVAL 7 DAY`,
        [LtvWindowType.d30]: `AND ${eventTime(timezone, "e.")} <= cu.start_date + INTERVAL 30 DAY`,
        [LtvWindowType.d90]: `AND ${eventTime(timezone, "e.")} <= cu.start_date + INTERVAL 90 DAY`,
        [LtvWindowType.AllTime]: ``,
      }[ltvWindowType || LtvWindowType.AllTime]
    }
    AND e.project_id = {projectId:String}
    ${whereStrings2.length ? `AND (${whereStrings2.join(whereCombiner2)})` : ""}
)
SELECT
    ${breakdownSelect ? `cu.breakdown,` : ``}
    cu.cohort_date,
    round(COALESCE(SUM(pd.purchase_amount), 0), 2) as total_revenue,
    toInt32(COUNT(DISTINCT pd.distinct_id)) as purchasing_users,
    toInt32(COUNT(DISTINCT cu.distinct_id)) as cohort_size,
    round(COALESCE(SUM(pd.purchase_amount), 0) / COUNT(DISTINCT cu.distinct_id), 2) as ltv_per_user,
    round(COALESCE(SUM(pd.purchase_amount), 0) / NULLIF(COUNT(DISTINCT pd.distinct_id), 0), 2) as revenue_per_purchasing_user
FROM cohort_users cu
LEFT JOIN purchase_data pd ON cu.distinct_id = pd.distinct_id
GROUP BY cu.cohort_date${breakdownSelect ? `, cu.breakdown` : ``}
ORDER BY cu.cohort_date${breakdownSelect ? `, cu.breakdown` : ``};
`;
  const resp = await clickhouse.query({
    query,
    query_params: {
      projectId,
      startEventName: metrics[0].event.value,
      endEventName: metrics[1].event.value,
      ...getDateRange({ timeRangeType, timezone, from, to }),
      ...paramHandler.getParams(),
    },
  });
  const { data } = await resp.json<
    ClickHouseQueryResponse<{
      cohort_date: string;
      total_revenue: number;
      purchasing_users: number;
      cohort_size: number;
      ltv_per_user: number;
      revenue_per_purchasing_user: number;
    }>
  >();

  if (!data.length) {
    // No data
    return [];
  }

  if (breakdownSelect) {
    // TODO: Implement breakdown
    return [];
    // return (
    //   data as unknown as (BreakdownData & { data: [string, number][] })[]
    // ).map((x) => {
    //   const dataMap: Record<string, number> = {};
    //   x.data.forEach((d) => {
    //     dataMap[d[0]] = d[1];
    //   });
    //   return {
    //     ...x,
    //     id: v4(),
    //     measurement: metric.type || MetricMeasurement.uniqueUsers,
    //     lineChartGroupByTimeType,
    //     eventLabel,
    //     data: {
    //       ...dateMap,
    //       ...dataMap,
    //     },
    //   };
    // });
  } else {
    const cohortSizeMap: Record<string, number> = {};
    const cohortSizeKey =
      ltvType === LtvType.allUsers ? "cohort_size" : "purchasing_users";
    data.forEach((x) => {
      cohortSizeMap[x.cohort_date] = x[cohortSizeKey];
    });

    const key =
      ltvType === LtvType.allUsers
        ? "ltv_per_user"
        : "revenue_per_purchasing_user";

    const dataMap: Record<string, number> = {};
    data.forEach((x) => {
      dataMap[x.cohort_date] = x[key];
    });

    const revenueMap: Record<string, number> = {};
    data.forEach((x) => {
      revenueMap[x.cohort_date] = x.total_revenue;
    });

    return [
      [
        {
          id: v4(),
          tableOnly: true,
          eventLabel:
            ltvType === LtvType.allUsers ? "Cohort size" : "Paying users",
          lineChartGroupByTimeType,
          average_count: !data.length
            ? 0
            : Math.round(
                (10 * data.reduce((a, b) => a + b[cohortSizeKey], 0)) /
                  dateHeaders.length
              ) / 10,
          data: {
            ...dateMap,
            ...cohortSizeMap,
          },
        },
        {
          id: v4(),
          tableOnly: true,
          eventLabel: "Revenue",
          lineChartGroupByTimeType,
          average_count: !data.length
            ? 0
            : Math.round(
                (10 * data.reduce((a, b) => a + b.total_revenue, 0)) /
                  dateHeaders.length
              ) / 10,
          data: {
            ...dateMap,
            ...revenueMap,
          },
        },
        {
          id: v4(),
          eventLabel: ltvType === LtvType.allUsers ? "ARPU" : "LTV",
          lineChartGroupByTimeType,
          average_count: !data.length
            ? 0
            : Math.round(
                (10 * data.reduce((a, b) => a + b[key], 0)) / dateHeaders.length
              ) / 10,
          data: {
            ...dateMap,
            ...dataMap,
          },
        },
      ],
    ];
  }
};
