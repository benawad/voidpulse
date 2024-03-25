import { v4 } from "uuid";
import {
  AggType,
  BreakdownType,
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
import { getAggFn } from "./getAggFn";

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
  timezone,
}: {
  timezone: string;
  globalFilters: MetricFilter[];
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  breakdowns: MetricFilter[];
  metric: InputMetric;
}): Promise<BarData[]> => {
  const isAggProp = metric.type === MetricMeasurement.aggProp;
  const {
    breakdownBucketMinMaxQuery,
    breakdownSelect,
    joinSection,
    query_params,
    whereSection,
  } = await prepareFiltersAndBreakdown({
    timezone,
    metric,
    globalFilters,
    breakdowns,
    projectId,
    timeRangeType,
    from,
    to,
    doPeopleJoin: isAggProp && metric.typeProp?.propOrigin === PropOrigin.user,
  });

  const isFrequency = metric.type === MetricMeasurement.frequencyPerUser;

  let query = `
  SELECT
      ${
        isAggProp
          ? `${getAggFn(metric.typeAgg || AggType.avg)}(JSONExtractFloat(${metric.typeProp?.propOrigin === PropOrigin.user ? "p.properties" : "e.properties"}, {typeProp:String})) as count`
          : `toInt32(count(${
              metric.type !== MetricMeasurement.uniqueUsers
                ? ``
                : `DISTINCT distinct_id`
            })) AS count`
      }
      ${breakdownSelect ? `, ${breakdownSelect}` : ""}
  FROM events as e${
    breakdownBucketMinMaxQuery ? `${breakdownBucketMinMaxQuery}` : ""
  }
  ${joinSection}
  WHERE ${whereSection}
  ${breakdownSelect || isFrequency ? `group by` : ""}
  ${isFrequency ? "distinct_id" : ""}
  ${breakdownSelect ? `${isFrequency ? "," : ""}breakdown order by count desc` : ""}
`;

  if (isFrequency) {
    query = `
  select
  ${getAggFn(metric.typeAgg || AggType.avg)}(x.count) as count
  ${breakdownSelect ? `,breakdown` : ""}
  from (${query}) as x
  ${breakdownSelect ? `group by breakdown` : ""}
  order by count desc
  `;
  }

  const resp = await clickhouse.query({
    query,
    query_params: {
      ...query_params,
      typeProp: metric.typeProp?.value,
    },
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
