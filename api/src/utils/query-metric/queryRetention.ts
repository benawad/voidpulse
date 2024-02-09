import {
  ANY_EVENT_VALUE,
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
  cohort_date: string;
  days_after_cohort: number;
  retained_users: number;
  cohort_size: number;
  retained_users_percent: number;
}

interface GroupedRetentionData {
  cohort_size: number;
  data: Record<number, RetentionEntry>; // Changed 'data' to a Record
}

export const queryRetention = async ({
  projectId,
  from,
  to,
  timeRangeType,
  metrics,
  breakdowns,
  globalFilters,
}: {
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  breakdowns: MetricFilter[];
  metrics: InputMetric[];
}) => {
  const {
    breakdownBucketMinMaxQuery,
    breakdownSelect,
    joinSection,
    query_params,
    whereSection,
  } = await prepareFiltersAndBreakdown({
    metric: metrics[0],
    globalFilters,
    breakdowns,
    projectId,
    timeRangeType,
    from,
    to,
  });

  let query = `
  WITH cohort_users AS (
    SELECT
      distinct_id,
      MIN(toDate(time)) AS cohort_date  -- The first activity date for each user within the specified time range
    FROM events
    WHERE time >= toDate({from:DateTime}) AND time <= toDate({to:DateTime})  -- Use actual DateTime values
    AND name = {startEventName:String} AND project_id = {projectId:String}
    GROUP BY distinct_id
  ),
  cohort_sizes AS (
    SELECT
      cohort_date,
      COUNT(DISTINCT distinct_id) AS cohort_size  -- Calculate the size of each cohort
    FROM cohort_users
    GROUP BY cohort_date
  ),
  activity_after_first_day AS (
    SELECT
      e.distinct_id,
      c.cohort_date,
      toDate(e.time) AS activity_date,
      dateDiff('day', c.cohort_date, toDate(e.time)) AS days_after_cohort  -- Calculate the difference in days from the cohort date
    FROM events e
    JOIN cohort_users c ON e.distinct_id = c.distinct_id
    WHERE toDate(e.time) >= c.cohort_date AND toDate(e.time) <= toDate({to:DateTime})  -- Use actual DateTime value
    AND name = {endEventName:String} AND project_id = {projectId:String}
  ),
  retention_counts AS (
    SELECT
      a.cohort_date,
      a.days_after_cohort,
      COUNT(DISTINCT a.distinct_id) AS retained_users,  -- Count unique users for each day after the cohort date
      s.cohort_size
    FROM activity_after_first_day a
    JOIN cohort_sizes s ON a.cohort_date = s.cohort_date
    GROUP BY a.cohort_date, a.days_after_cohort, s.cohort_size
  )
  SELECT
    cohort_date,
    toInt32(days_after_cohort) AS days_after_cohort,
    toInt32(retained_users) AS retained_users,
    toInt32(cohort_size) AS cohort_size,
    toFloat64(retained_users) / cohort_size * 100 AS retained_users_percent
  FROM retention_counts
  ORDER BY cohort_date, days_after_cohort;
`;
  if (!__prod__) {
    console.log(query);
  }
  const resp = await clickhouse.query({
    query,
    query_params: {
      projectId,
      startEventName: metrics[0].event.value,
      endEventName: metrics[1].event.value,
      ...getDateRange(timeRangeType, from, to),
    },
  });
  const { data } = await resp.json<ClickHouseQueryResponse<RetentionEntry>>();

  const grouped: Record<string, GroupedRetentionData> = data.reduce(
    (acc: Record<string, GroupedRetentionData>, item: RetentionEntry) => {
      const { cohort_date, cohort_size, days_after_cohort } = item;

      if (!acc[cohort_date]) {
        acc[cohort_date] = {
          cohort_size: cohort_size,
          data: {}, // Initialize 'data' as an empty object
        };
      }

      // Assign the item to the 'data' object using 'days_after_cohort' as the key
      acc[cohort_date].data[days_after_cohort] = item;

      return acc;
    },
    {}
  );

  const averageRetention: Record<
    number,
    {
      totalRetained: number;
      cohortCount: number;
      cohortSizeSum: number;
    }
  > = {};

  Object.keys(grouped).forEach((cohortDate) => {
    const cohortData = grouped[cohortDate].data;

    Object.keys(cohortData).forEach((day) => {
      const dayNumber = parseInt(day);
      const retainedUsers = cohortData[dayNumber].retained_users;

      // Initialize the day in the averageRetention object if it doesn't exist
      if (!averageRetention[dayNumber]) {
        averageRetention[dayNumber] = {
          totalRetained: 0,
          cohortCount: 0,
          cohortSizeSum: 0,
        };
      }

      // Sum up the retained users for the day across all cohorts
      averageRetention[dayNumber].totalRetained += retainedUsers;
      // Increment the cohort count that includes this day
      averageRetention[dayNumber].cohortCount += 1;
      // Sum up the cohort sizes for the day across all cohorts
      averageRetention[dayNumber].cohortSizeSum +=
        grouped[cohortDate].cohort_size;
    });
  });

  // Compute the average retention for each day
  const averageRetentionByDay: Record<
    number,
    {
      avgRetained: number;
      avgRetainedPercent: number;
    }
  > = {};

  Object.keys(averageRetention).forEach((day) => {
    const dayNumber = parseInt(day);
    const { totalRetained, cohortCount, cohortSizeSum } =
      averageRetention[dayNumber];
    const avgRetained = Math.round(totalRetained / cohortCount);
    const avgCohortSize = cohortSizeSum / cohortCount;
    const avgRetainedPercent =
      Math.round((avgRetained / avgCohortSize) * 100 * 100) / 100;
    averageRetentionByDay[dayNumber] = {
      avgRetained,
      avgRetainedPercent,
    };
  });

  return [
    {
      id: v4(),
      eventLabel: "",
      averageRetentionByDay,
      grouped,
    },
  ];
};
