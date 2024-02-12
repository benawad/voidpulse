import {
  ANY_EVENT_VALUE,
  ChartTimeRangeType,
  DataType,
  FilterAndOr,
  LineChartGroupByTimeType,
  MetricMeasurement,
  PropOrigin,
} from "../../app-router-type";
import { QueryParamHandler } from "./QueryParamHandler";
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

type BreakdownData = {
  id: string;
  eventLabel: string;
  measurement: MetricMeasurement;
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
  breakdown?: any;
  average_count: number;
  data: Record<string, number>;
};

export const queryLineChartMetric = async ({
  projectId,
  from,
  to,
  metric,
  breakdowns,
  timeRangeType,
  lineChartGroupByTimeType = LineChartGroupByTimeType.day,
  dateMap,
  globalFilters,
}: {
  dateMap: Record<string, number>;
  dateHeaders: Array<{
    label: string;
    lookupValue: string;
  }>;
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  breakdowns: MetricFilter[];
  metric: InputMetric;
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
}): Promise<BreakdownData[]> => {
  const {
    breakdownBucketMinMaxQuery,
    breakdownSelect,
    joinSection,
    query_params,
    whereSection,
  } = await prepareFiltersAndBreakdown({
    metric,
    globalFilters,
    breakdowns,
    projectId,
    timeRangeType,
    from,
    to,
  });

  let query = `
  SELECT
      ${
        {
          [LineChartGroupByTimeType.day]: "toStartOfDay",
          [LineChartGroupByTimeType.week]: "toStartOfWeek",
          [LineChartGroupByTimeType.month]: "toStartOfMonth",
        }[lineChartGroupByTimeType]
      }(time${
        lineChartGroupByTimeType === LineChartGroupByTimeType.week ? `, 1` : ""
      }) AS day,
      toInt32(count(${
        metric.type === MetricMeasurement.totalEvents
          ? ``
          : `DISTINCT distinct_id`
      })) AS count
      ${breakdownSelect ? `, ${breakdownSelect}` : ""}
  FROM events as e${
    breakdownBucketMinMaxQuery ? `${breakdownBucketMinMaxQuery}` : ""
  }
  ${joinSection}
  WHERE ${whereSection}
  GROUP BY day${breakdownSelect ? ", breakdown" : ""}
  ORDER BY day ASC
`;
  if (breakdownSelect) {
    query = `
    select
    breakdown,
    round(avg(count), 1) as average_count,
    groupArray((day, count)) as data
    from (${query})
    group by breakdown
    order by average_count desc
    limit 500
    `;
  }
  const resp = await clickhouse.query({
    query,
    query_params,
  });
  const { data } = await resp.json<ClickHouseQueryResponse<InsightData>>();
  const eventLabel = metricToEventLabel(metric);

  if (breakdownSelect) {
    return (
      data as unknown as (BreakdownData & { data: [string, number][] })[]
    ).map((x) => {
      const dataMap: Record<string, number> = {};
      x.data.forEach((d) => {
        dataMap[d[0]] = d[1];
      });
      return {
        ...x,
        id: v4(),
        measurement: metric.type || MetricMeasurement.uniqueUsers,
        groupByTimeType: lineChartGroupByTimeType,
        eventLabel,
        data: {
          ...dateMap,
          ...dataMap,
        },
      };
    });
  } else {
    const dataMap: Record<string, number> = {};
    data.forEach((x) => {
      dataMap[x.day] = x.count;
    });

    return [
      {
        id: v4(),
        eventLabel,
        measurement: metric.type || MetricMeasurement.uniqueUsers,
        lineChartGroupByTimeType: lineChartGroupByTimeType,
        average_count: !data.length
          ? 0
          : Math.round(
              (10 * data.reduce((a, b) => a + b.count, 0)) / data.length
            ) / 10,
        data: {
          ...dateMap,
          ...dataMap,
        },
      },
    ];
  }
};
