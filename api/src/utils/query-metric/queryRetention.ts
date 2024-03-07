import {
  ANY_EVENT_VALUE,
  BreakdownType,
  ChartTimeRangeType,
  DataType,
  DateHeader,
  FilterAndOr,
  LineChartGroupByTimeType,
  MetricMeasurement,
  PropOrigin,
} from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { __prod__ } from "../../constants/prod";
import { filtersToSql } from "../filtersToSql";
import {
  InputMetric,
  MetricFilter,
} from "../../routes/charts/insight/eventFilterSchema";
import { InsightData } from "../../routes/charts/insight/getReport";
import { getDateRange } from "../getDateRange";
import { v4 } from "uuid";
import { prepareFiltersAndBreakdown } from "./prepareFiltersAndBreakdown";
import { metricToEventLabel } from "./metricToEventLabel";
import { QueryParamHandler } from "./QueryParamHandler";
import { breakdownSelectProperty } from "./breakdownSelectProperty";
import { clampNum } from "../clampNum";
import { eventTime, inputTime } from "../eventTime";

// type RetentionData = {
//   id: string;
//   eventLabel: string;
//   measurement: MetricMeasurement;
//   lineChartGroupByTimeType?: LineChartGroupByTimeType;
//   breakdown?: any;
//   average_count: number;
//   data: Record<string, number>;
// };

interface RetentionEntry {
  breakdown?: BreakdownType;
  cohort_date: string;
  days_after_cohort: number;
  retained_users: number;
  cohort_size: number;
  retained_users_percent: number;
}

interface RetentionBreakdownGroup {
  id: string;
  eventLabel: string;
  breakdown?: BreakdownType;
  cohortSize: number;
  averageRetentionByDay: Record<
    number,
    { avgRetained: number; avgRetainedPercent: number }
  >;
  data: Record<
    string,
    {
      cohortSize: number;
      retentionByDay: Record<number, RetentionEntry>;
    }
  >;
}

export const queryRetention = async ({
  projectId,
  from,
  to,
  timeRangeType,
  metrics,
  breakdowns,
  globalFilters,
  timezone,
}: {
  timezone: string;
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
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
    ? breakdownSelectProperty(breakdowns[0], paramHandler)
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
      MIN(toDate(${eventTime(timezone)})) AS cohort_date  -- The first activity date for each user within the specified time range
    FROM events as e
    ${firstWhereSection}
    ${
      breakdownSelect
        ? `AND breakdown IN (SELECT breakdown FROM top_breakdown)`
        : ``
    }
    GROUP BY distinct_id${breakdownSelect ? `, breakdown` : ``}
  ),
  cohort_sizes AS (
    SELECT
      ${breakdownSelect ? `breakdown,` : ``}
      cohort_date,
      COUNT(DISTINCT distinct_id) AS cohort_size  -- Calculate the size of each cohort
    FROM cohort_users
    GROUP BY cohort_date${breakdownSelect ? `, breakdown` : ``}
  ),
  activity_after_first_day AS (
    SELECT
      ${breakdownSelect ? `c.breakdown,` : ``}
      e.distinct_id,
      c.cohort_date,
      toDate(${eventTime(timezone, "e.")}) AS activity_date,
      dateDiff('day', c.cohort_date, activity_date) AS days_after_cohort  -- Calculate the difference in days from the cohort date
    FROM events as e
    ${needsPeopleJoin2 ? peopleJoin : ""}
    JOIN cohort_users c ON e.distinct_id = c.distinct_id
    WHERE activity_date >= c.cohort_date AND activity_date <= ${inputTime("to", timezone)}  -- Use actual DateTime value
    ${metrics[1].event.value !== ANY_EVENT_VALUE ? `AND name = {endEventName:String}` : ``}
    AND e.project_id = {projectId:String}
    ${whereStrings2.length ? `AND (${whereStrings2.join(whereCombiner2)})` : ""}
  ),
  retention_counts AS (
    SELECT
      ${breakdownSelect ? `a.breakdown,` : ``}
      a.cohort_date,
      a.days_after_cohort,
      COUNT(DISTINCT a.distinct_id) AS retained_users,  -- Count unique users for each day after the cohort date
      s.cohort_size
    FROM activity_after_first_day a
    JOIN cohort_sizes s ON a.cohort_date = s.cohort_date ${breakdownSelect ? `AND a.breakdown = s.breakdown` : ``}
    GROUP BY a.cohort_date${
      breakdownSelect ? `, a.breakdown` : ``
    }, a.days_after_cohort, s.cohort_size
  )
  SELECT
    ${breakdownSelect ? `breakdown,` : ``}
    cohort_date,
    toInt32(days_after_cohort) AS days_after_cohort,
    toInt32(retained_users) AS retained_users,
    toInt32(cohort_size) AS cohort_size,
    least(round(toFloat64(retained_users) / cohort_size * 100, 2), 100) AS retained_users_percent
  FROM retention_counts
  ORDER BY cohort_date${
    breakdownSelect ? `, breakdown` : ``
  }, days_after_cohort;
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
  const { data } = await resp.json<ClickHouseQueryResponse<RetentionEntry>>();

  const breakdownGroups: Record<string, RetentionBreakdownGroup> = {};

  // First, group data by breakdown
  data.forEach((item) => {
    const {
      breakdown = "",
      cohort_date,
      days_after_cohort,
      cohort_size,
    } = item;

    if (!breakdownGroups[breakdown]) {
      breakdownGroups[breakdown] = {
        id: v4(),
        eventLabel: "Average retention",
        breakdown,
        cohortSize: cohort_size,
        averageRetentionByDay: {},
        data: {},
      };
    }

    if (!breakdownGroups[breakdown].data[cohort_date]) {
      breakdownGroups[breakdown].data[cohort_date] = {
        cohortSize: cohort_size,
        retentionByDay: {},
      };
    }

    breakdownGroups[breakdown].data[cohort_date].retentionByDay[
      days_after_cohort
    ] = item;
  });

  // Then, compute average retention for each day within each breakdown
  Object.keys(breakdownGroups).forEach((breakdownKey) => {
    const breakdownGroup = breakdownGroups[breakdownKey];
    const averageRetention: Record<
      number,
      { totalRetained: number; cohortCount: number; cohortSizeSum: number }
    > = {};

    Object.keys(breakdownGroup.data).forEach((cohortDate) => {
      Object.values(breakdownGroup.data[cohortDate].retentionByDay).forEach(
        (entry) => {
          const { days_after_cohort, retained_users, cohort_size } = entry;
          if (!averageRetention[days_after_cohort]) {
            averageRetention[days_after_cohort] = {
              totalRetained: 0,
              cohortCount: 0,
              cohortSizeSum: 0,
            };
          }

          averageRetention[days_after_cohort].totalRetained += retained_users;
          averageRetention[days_after_cohort].cohortCount += 1;
          averageRetention[days_after_cohort].cohortSizeSum += cohort_size;
        }
      );
    });

    // Compute the average retention for each day
    Object.keys(averageRetention).forEach((day) => {
      const { totalRetained, cohortCount, cohortSizeSum } =
        averageRetention[parseInt(day)];
      const avgRetained = Math.round(totalRetained / cohortCount);
      const avgCohortSize = cohortSizeSum / cohortCount;
      breakdownGroup.averageRetentionByDay[parseInt(day)] = {
        avgRetained,
        avgRetainedPercent: clampNum(
          Math.round((avgRetained / avgCohortSize) * 100 * 100) / 100,
          0,
          100
        ),
      };
    });
  });

  return Object.values(breakdownGroups);
};
