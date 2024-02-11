import { v4 } from "uuid";
import {
  ChartTimeRangeType,
  MetricMeasurement,
  PropOrigin,
} from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import { __prod__ } from "../../constants/prod";
import {
  InputMetric,
  MetricFilter,
} from "../../routes/charts/insight/eventFilterSchema";
import { metricToEventLabel } from "./metricToEventLabel";
import { prepareFiltersAndBreakdown } from "./prepareFiltersAndBreakdown";
import { getDateRange } from "../getDateRange";
import { QueryParamHandler } from "./QueryParamHandler";
import { breakdownSelectProperty } from "./breakdownSelectProperty";

type BarData = {
  id: string;
  eventLabel: string;
  measurement: MetricMeasurement;
  breakdown?: any;
  value: number;
};

export const queryFunnel = async ({
  projectId,
  from,
  to,
  metrics,
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
  metrics: InputMetric[];
}): Promise<BarData[]> => {
  const paramHandler = new QueryParamHandler();
  const peopleJoin = `inner join people as p on e.distinct_id = p.distinct_id`;
  const breakdownSelect = breakdowns.length
    ? breakdownSelectProperty(breakdowns[0], paramHandler)
    : "";

  const query = `
  WITH top_breakdown AS (
    SELECT ${breakdownSelect} as breakdown
    FROM events as e
    ${
      breakdowns.length && breakdowns[0].propOrigin === PropOrigin.user
        ? peopleJoin
        : ""
    }
    WHERE time >= toDate({from:DateTime}) AND time <= toDate({to:DateTime})
    AND e.project_id = {projectId:String}
    GROUP BY breakdown
    ORDER BY COUNT(DISTINCT distinct_id) DESC
    LIMIT 10
  )
  SELECT
  breakdown,
  COUNT(DISTINCT if(sequenceA, distinct_id, NULL)) AS users_reached_A,
  COUNT(DISTINCT if(sequenceAB, distinct_id, NULL)) AS users_reached_B,
  COUNT(DISTINCT if(sequenceABC, distinct_id, NULL)) AS users_reached_C
FROM (
  SELECT
      distinct_id,
      JSONExtractString(properties, 'eventType') AS breakdown,
      sequenceMatch('(?1)')(time, name = 'Event A') AS sequenceA,
      sequenceMatch('(?1).*(?2)')(time, name = 'Event A', name = 'Event B') AS sequenceAB,
      sequenceMatch('(?1).*(?2).*(?3)')(time, name = 'Event A', name = 'Event B', name = 'Event C') AS sequenceABC
  FROM events as e
  WHERE time >= toDate({from:DateTime}) AND time <= toDate({to:DateTime})
  AND e.project_id = {projectId:String}
  AND name IN (${metrics.map((m) => paramHandler.add(m.event.value))})
  GROUP BY
      distinct_id, breakdown
)
GROUP BY breakdown
  `;
  if (!__prod__) {
    console.log(query);
  }
  const resp = await clickhouse.query({
    query,
    query_params: {
      projectId,
      ...getDateRange(timeRangeType, from, to),
      ...paramHandler.getParams(),
    },
  });
  const { data } = await resp.json<
    ClickHouseQueryResponse<{ count: number; breakdown?: any }>
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
