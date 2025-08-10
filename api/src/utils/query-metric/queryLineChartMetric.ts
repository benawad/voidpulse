import { v4 } from "uuid";
import {
  AggType,
  BreakdownType,
  ChartTimeRangeType,
  EventCombination,
  LineChartGroupByTimeType,
  LtvWindowType,
  MetricMeasurement,
  PropOrigin,
} from "../../app-router-type";
import { ClickHouseQueryResponse, clickhouse } from "../../clickhouse";
import {
  InputMetric,
  MetricFilter,
} from "../../routes/charts/insight/eventFilterSchema";
import { InsightData } from "../../routes/charts/insight/getReport";
import { metricToEventLabel } from "./metricToEventLabel";
import { prepareFiltersAndBreakdown } from "./prepareFiltersAndBreakdown";
import { eventTime } from "../eventTime";
import { getAggFn } from "./getAggFn";
import { db } from "../../db";
import { fbCampaignSpend } from "../../schema/fbCampaignSpend";
import { and, between, inArray } from "drizzle-orm";
import { getDateRange } from "../getDateRange";
import {
  createSpendRow,
  infuseDataMapWithSpend,
} from "../fb/infuseDataMapWithSpend";

type BreakdownData = {
  id: string;
  eventLabel: string;
  measurement: MetricMeasurement;
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
  breakdown?: BreakdownType;
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
  timezone,
  dateHeaders,
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
  combinations?: EventCombination[] | null;
  metric: InputMetric;
  lineChartGroupByTimeType?: LineChartGroupByTimeType;
  timezone: string;
  ltvWindowType?: LtvWindowType | null;
}): Promise<BreakdownData[]> => {
  const isAggProp = metric.type === MetricMeasurement.aggProp;
  const {
    breakdownBucketMinMaxQuery,
    breakdownSelect,
    breakdownJoin,
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
        {
          [LineChartGroupByTimeType.day]: "toStartOfDay",
          [LineChartGroupByTimeType.week]: "toStartOfWeek",
          [LineChartGroupByTimeType.month]: "toStartOfMonth",
        }[lineChartGroupByTimeType]
      }(${eventTime(timezone)}${
        lineChartGroupByTimeType === LineChartGroupByTimeType.week ? `, 1` : ""
      }) AS day,
      ${
        isAggProp
          ? `${getAggFn(metric.typeAgg || AggType.avg)}(JSONExtractFloat(${metric.typeProp?.propOrigin === PropOrigin.user ? "p.properties" : "e.properties"}, {typeProp:String}))${
              metric.typeAgg === AggType.sumDivide100 ? "/100" : ""
            } as count`
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
  ${breakdownJoin}
  WHERE ${whereSection}
  GROUP BY day
  ${isFrequency ? ",distinct_id" : ""}
  ${breakdownSelect ? ",breakdown" : ""}
  ORDER BY day ASC
`;
  if (isFrequency) {
    query = `
    select
    day,
    ${getAggFn(metric.typeAgg || AggType.avg)}(x.count)${
      metric.typeAgg === AggType.sumDivide100 ? "/100" : ""
    } as count
    ${breakdownSelect ? `,breakdown` : ""}
    from (${query}) as x
    group by day${breakdownSelect ? `,breakdown` : ""}
    order by day asc
    `;
  }
  if (breakdownSelect) {
    query = `
    select
    breakdown,
    round(sum(count) / ${dateHeaders.length}, 1) as average_count,
    groupArray((day, count)) as data
    from (${query})
    group by breakdown
    order by average_count desc
    limit 500
    `;
  }
  const resp = await clickhouse.query({
    query,
    query_params: {
      ...query_params,
      typeProp: metric.typeProp?.value,
    },
  });
  const { data } = await resp.json<ClickHouseQueryResponse<InsightData>>();
  const eventLabel = metricToEventLabel(metric);

  if (!data.length) {
    // No data
    return [];
  }

  let campaignSpend: {
    campaignId: string;
    campaignName: string;
    spend: number;
    date: string;
  }[] = [];

  if (metric.fbCampaignIds) {
    const dtRange = getDateRange({ timeRangeType, timezone, from, to });
    campaignSpend = await db
      .select()
      .from(fbCampaignSpend)
      .where(
        and(
          inArray(fbCampaignSpend.campaignId, metric.fbCampaignIds),
          between(fbCampaignSpend.date, dtRange.from, dtRange.to)
        )
      );
  }

  if (breakdownSelect) {
    const result = (
      data as unknown as (BreakdownData & { data: [string, number][] })[]
    ).flatMap((x) => {
      const dataMap: Record<string, number> = {};
      x.data.forEach((d) => {
        dataMap[d[0]] = d[1];
      });
      let campaignData: Record<string, number> = {};
      if (campaignSpend.length) {
        campaignData = infuseDataMapWithSpend({
          dataMap,
          campaignSpend,
          groupByTimeType: lineChartGroupByTimeType,
        });
      }
      return [
        {
          ...x,
          id: v4(),
          tableOnly: !!campaignSpend.length,
          measurement: metric.type || MetricMeasurement.uniqueUsers,
          lineChartGroupByTimeType,
          eventLabel,
          data: {
            ...dateMap,
            ...dataMap,
          },
        },
        ...(campaignSpend.length
          ? [
              {
                id: v4(),
                eventLabel: `Spend / ${x.breakdown}`,
                tableOnly: false,
                measurement: metric.type || MetricMeasurement.uniqueUsers,
                lineChartGroupByTimeType,
                average_count: !Object.keys(campaignData).length
                  ? 0
                  : Math.round(
                      (10 *
                        Object.values(campaignData).reduce(
                          (a, b) => a + b,
                          0
                        )) /
                        dateHeaders.length
                    ) / 10,
                data: {
                  ...dateMap,
                  ...campaignData,
                },
              },
            ]
          : []),
      ];
    });

    if (campaignSpend.length) {
      result.unshift(
        createSpendRow({
          spend: campaignSpend,
          dateMap,
          dateHeaders,
          lineChartGroupByTimeType,
          measurement: metric.type || MetricMeasurement.uniqueUsers,
        })
      );
    }

    return result;
  } else {
    const dataMap: Record<string, number> = {};
    data.forEach((x) => {
      dataMap[x.day] = x.count;
    });

    let campaignData: Record<string, number> = {};
    if (campaignSpend.length) {
      campaignData = infuseDataMapWithSpend({
        dataMap,
        campaignSpend,
        groupByTimeType: lineChartGroupByTimeType,
      });
    }

    return [
      {
        id: v4(),
        eventLabel:
          campaignSpend.length || !metric.customLabel
            ? metric.customLabel
              ? `${eventLabel} - ${metric.customLabel}`
              : eventLabel
            : metric.customLabel,
        tableOnly: !!campaignSpend.length,
        measurement: metric.type || MetricMeasurement.uniqueUsers,
        lineChartGroupByTimeType,
        average_count: !data.length
          ? 0
          : Math.round(
              (10 * data.reduce((a, b) => a + b.count, 0)) / dateHeaders.length
            ) / 10,
        data: {
          ...dateMap,
          ...dataMap,
        },
      },
      ...(campaignSpend.length
        ? [
            {
              id: v4(),
              eventLabel: metric.customLabel || `Spend / ${eventLabel}`,
              measurement: metric.type || MetricMeasurement.uniqueUsers,
              lineChartGroupByTimeType,
              average_count: !Object.keys(campaignData).length
                ? 0
                : Math.round(
                    (10 *
                      Object.values(campaignData).reduce((a, b) => a + b, 0)) /
                      dateHeaders.length
                  ) / 10,
              data: {
                ...dateMap,
                ...campaignData,
              },
            },
            createSpendRow({
              spend: campaignSpend,
              dateMap,
              measurement: metric.type || MetricMeasurement.uniqueUsers,
              dateHeaders,
              lineChartGroupByTimeType,
              customLabel: metric.customLabel,
            }),
          ]
        : []),
    ];
  }
};
