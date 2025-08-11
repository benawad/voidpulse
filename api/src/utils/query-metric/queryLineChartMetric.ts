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
import { eventTime, inputTime } from "../eventTime";
import { getAggFn } from "./getAggFn";
import { db } from "../../db";
import { fbCampaignSpend } from "../../schema/fbCampaignSpend";
import { and, between, inArray } from "drizzle-orm";
import { getDateRange } from "../getDateRange";
import {
  createSpendRow,
  infuseDataMapWithSpend,
} from "../fb/infuseDataMapWithSpend";
import { __prod__ } from "../../constants/prod";

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
  ltvWindowType,
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
    needsLtvWindow,
  } = await prepareFiltersAndBreakdown({
    timezone,
    metric,
    globalFilters,
    breakdowns,
    projectId,
    timeRangeType,
    from,
    to,
    doPeopleJoin:
      (isAggProp && metric.typeProp?.propOrigin === PropOrigin.user) ||
      (breakdowns.length > 0 && breakdowns[0]?.propOrigin === PropOrigin.user),
    ltvWindowType,
  });

  const isFrequency = metric.type === MetricMeasurement.frequencyPerUser;

  // If LTV window is specified and not NoWindow, create a cohort-based query
  if (
    ltvWindowType &&
    ltvWindowType !== LtvWindowType.NoWindow &&
    ltvWindowType !== LtvWindowType.AllTime
  ) {
    const ltvWindowDays = {
      [LtvWindowType.d7]: 7,
      [LtvWindowType.d30]: 30,
      [LtvWindowType.d90]: 90,
    }[ltvWindowType];

    let query = `
      SELECT
        ${breakdownSelect ? `${breakdownSelect.replace(/e\./g, "target_events.")},` : ""}
        ${
          {
            [LineChartGroupByTimeType.day]: "toStartOfDay",
            [LineChartGroupByTimeType.week]: "toStartOfWeek",
            [LineChartGroupByTimeType.month]: "toStartOfMonth",
          }[lineChartGroupByTimeType]
        }(${eventTime(timezone, "create_events.")}) AS cohort_date,
        ${
          isAggProp
            ? `${getAggFn(metric.typeAgg || AggType.avg)}(JSONExtractFloat(${metric.typeProp?.propOrigin === PropOrigin.user ? "p.properties" : "target_events.properties"}, {typeProp:String}))${
                metric.typeAgg === AggType.sumDivide100 ? "/100" : ""
              }`
            : `toInt32(count(${
                metric.type !== MetricMeasurement.uniqueUsers
                  ? ``
                  : `DISTINCT create_events.distinct_id`
              }))`
        } AS event_count
      FROM events as create_events
      JOIN events as target_events ON create_events.distinct_id = target_events.distinct_id
      ${breakdownBucketMinMaxQuery ? `${breakdownBucketMinMaxQuery.replace(/e\./g, "target_events.").replace(/p\./g, "p.")}` : ""}
      ${joinSection.replace(/e\./g, "target_events.")}
      ${breakdownJoin.replace(/e\./g, "target_events.")}
      WHERE create_events.project_id = {projectId:UUID}
        AND create_events.name = '${__prod__ ? "CreateUser" : "Register"}'
        AND ${eventTime(timezone, "create_events.")} >= {from:String}
        AND ${eventTime(timezone, "create_events.")} <= {to:String}
        AND target_events.project_id = {projectId:UUID}
        AND target_events.name = {eventName:String}
        AND ${eventTime(timezone, "target_events.")}
        >= ${eventTime(timezone, "create_events.")}
        AND ${eventTime(timezone, "target_events.")}
        <= (${eventTime(timezone, "create_events.")} + INTERVAL ${ltvWindowDays} DAY)
        AND target_events.time < now()
      GROUP BY
        ${breakdownSelect ? `breakdown,` : ""}
        cohort_date
      ORDER BY cohort_date ASC
      `;

    const resp = await clickhouse.query({
      query,
      query_params: {
        ...query_params,
        eventName: metric.event.value,
        typeProp: metric.typeProp?.value,
      },
    });
    const { data } = await resp.json<
      ClickHouseQueryResponse<{
        cohort_date: string;
        event_count: number;
        breakdown?: string;
      }>
    >();

    // console.log(data);
    // console.log(data.length);

    // if (5 > 0) {
    //   return [];
    // }

    if (!data.length) {
      return [];
    }

    // Process the cohort data to create the line chart format
    const cohortDataMap: Record<string, number> = {};
    // The original logic was overly nested and stored event counts in a structure keyed by [breakdown][cohortDate][cohortDate].
    // This is unnecessarily complex. Instead, we should use [breakdown][cohortDate] = eventCount and [cohortDate] = eventCount for non-breakdown.
    const breakdownCohortDataMap: Record<string, Record<string, number>> = {};

    data.forEach((row) => {
      const cohortDate = row.cohort_date;
      const eventCount = row.event_count;
      const breakdown = row.breakdown;

      if (breakdown !== undefined && breakdown !== null) {
        if (!breakdownCohortDataMap[breakdown]) {
          breakdownCohortDataMap[breakdown] = {};
        }
        breakdownCohortDataMap[breakdown][cohortDate] = eventCount;
      } else {
        cohortDataMap[cohortDate] = eventCount;
      }
    });

    if (breakdownSelect) {
      // Return breakdown data
      return Object.entries(breakdownCohortDataMap).map(
        ([breakdown, cohortData]) => {
          const dataMap: Record<string, number> = {};
          // cohortData is now Record<string, number> where key is cohortDate and value is eventCount
          Object.entries(cohortData).forEach(([cohortDate, eventCount]) => {
            dataMap[cohortDate] = eventCount;
          });

          return {
            id: v4(),
            eventLabel: `${metricToEventLabel(metric)} - ${breakdown}`,
            measurement: metric.type || MetricMeasurement.uniqueUsers,
            lineChartGroupByTimeType,
            breakdown,
            average_count:
              Math.round(
                (10 * Object.values(dataMap).reduce((a, b) => a + b, 0)) /
                  dateHeaders.length
              ) / 10,
            data: {
              ...dateMap,
              ...dataMap,
            },
          };
        }
      );
    } else {
      // Return aggregated cohort data
      const dataMap: Record<string, number> = {};
      // cohortDataMap is now Record<string, number> where key is cohortDate and value is eventCount
      Object.entries(cohortDataMap).forEach(([cohortDate, eventCount]) => {
        dataMap[cohortDate] = eventCount;
      });

      return [
        {
          id: v4(),
          eventLabel: metricToEventLabel(metric),
          measurement: metric.type || MetricMeasurement.uniqueUsers,
          lineChartGroupByTimeType,
          average_count:
            Math.round(
              (10 * Object.values(dataMap).reduce((a, b) => a + b, 0)) /
                dateHeaders.length
            ) / 10,
          data: {
            ...dateMap,
            ...dataMap,
          },
        },
      ];
    }
  }

  // Original query logic for non-LTV window cases
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
