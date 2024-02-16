import { v4 } from "uuid";
import {
  BreakdownType,
  ChartTimeRangeType,
  MetricMeasurement,
} from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { __prod__ } from "../../constants/prod";
import {
  InputMetric,
  MetricFilter,
} from "../../routes/charts/insight/eventFilterSchema";
import { metricToEventLabel } from "./metricToEventLabel";
import { prepareFiltersAndBreakdown } from "./prepareFiltersAndBreakdown";

type BarData = {
  id: string;
  eventLabel: string;
  measurement: MetricMeasurement;
  breakdown?: BreakdownType;
  value: number;
};

export const queryBarChartMetric = async ({
  projectId,
  from,
  to,
  metric,
  breakdowns,
  timeRangeType,
  globalFilters,
}: {
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  breakdowns: MetricFilter[];
  metric: InputMetric;
}): Promise<BarData[]> => {
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
  ${breakdownSelect ? "group by breakdown order by count desc" : ""}
`;
  const resp = await clickhouse.query({
    query,
    query_params,
  });
  const { data } =
    await resp.json<
      ClickHouseQueryResponse<{ count: number; breakdown?: BreakdownType }>
    >();
  const eventLabel = metricToEventLabel(metric);

  return data.map((d) => ({
    id: v4(),
    eventLabel,
    measurement: metric.type || MetricMeasurement.uniqueUsers,
    value: d.count,
    breakdown: d.breakdown,
  }));
};
