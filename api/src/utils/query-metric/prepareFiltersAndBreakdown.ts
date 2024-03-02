import {
  PropOrigin,
  FilterAndOr,
  ANY_EVENT_VALUE,
  DataType,
  ChartTimeRangeType,
} from "../../app-router-type";
import { clickhouse, ClickHouseQueryResponse } from "../../clickhouse";
import { __prod__ } from "../../constants/prod";
import {
  InputMetric,
  MetricFilter,
} from "../../routes/charts/insight/eventFilterSchema";
import { eventTime, inputTime } from "../eventTime";
import { filtersToSql } from "../filtersToSql";
import { getDateRange } from "../getDateRange";
import { QueryParamHandler } from "./QueryParamHandler";
import { breakdownSelectProperty } from "./breakdownSelectProperty";

export const prepareFiltersAndBreakdown = async ({
  metric,
  globalFilters,
  breakdowns,
  projectId,
  timeRangeType,
  from,
  to,
  timezone,
}: {
  timezone: string;
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  metric: InputMetric;
  globalFilters: MetricFilter[];
  breakdowns: MetricFilter[];
}) => {
  const paramHandler = new QueryParamHandler();
  const { whereStrings, needsPeopleJoin } = filtersToSql(
    [...metric.filters, ...globalFilters],
    paramHandler
  );
  const whereCombiner = metric.andOr === FilterAndOr.or ? " OR " : " AND ";
  const joinSection =
    needsPeopleJoin ||
    (breakdowns.length && breakdowns[0].propOrigin === PropOrigin.user)
      ? `inner join people as p on e.distinct_id = p.distinct_id `
      : "";
  const whereSection = `
  project_id = {projectId:UUID}
    AND ${eventTime(timezone)} >= ${inputTime("from", timezone)}
    AND ${eventTime(timezone)} <= ${inputTime("to", timezone)}
    ${
      metric.event.value !== ANY_EVENT_VALUE
        ? `AND name = {eventName:String}`
        : ``
    }
    ${whereStrings.length ? `AND (${whereStrings.join(whereCombiner)})` : ""}
    `;
  let breakdownSelect = "";
  let breakdownBucketMinMaxQuery = "";
  let shouldBucketData = false;
  if (breakdowns.length) {
    const b = breakdowns[0];
    breakdownSelect = breakdownSelectProperty(b, paramHandler);
    if (b.dataType === DataType.number) {
      const query = `
      select count(distinct ${breakdownSelect}) > 10 as shouldBucket
      from events as e
      ${joinSection}
      where ${whereSection}`;
      const resp0 = await clickhouse.query({
        query,
        query_params: {
          projectId,
          ...getDateRange({ timeRangeType, from, to }),
          eventName: metric.event.value,
          ...paramHandler.getParams(),
        },
      });
      const {
        data: [r0],
      } =
        await resp0.json<ClickHouseQueryResponse<{ shouldBucket: boolean }>>();
      if (r0 && r0.shouldBucket) {
        shouldBucketData = true;
        const numBuckets = 10;
        breakdownBucketMinMaxQuery = `, (SELECT
          min(${breakdownSelect}) AS min_breakdown,
          max(${breakdownSelect}) AS max_breakdown
          from events as e
          where ${whereSection}) as breakdown_min_max`;
        const bucket_idx = `widthBucket(${breakdownSelect}, min_breakdown, max_breakdown, ${numBuckets})`;
        const breakdownBucketSize = `(max_breakdown - min_breakdown) / ${numBuckets}`;
        const bucket_start = `round(min_breakdown + ${breakdownBucketSize} * (${bucket_idx} - 1), 2)`;
        const bucket_end = `round(${bucket_start} + ${breakdownBucketSize}, 2)`;
        breakdownSelect = `
        (toString(${bucket_start}) || '-' || toString(${bucket_end})) as breakdown
        `;
      }
    }
  }
  if (breakdownSelect && !shouldBucketData) {
    breakdownSelect = `${breakdownSelect} as breakdown`;
  }

  return {
    query_params: {
      projectId,
      ...getDateRange({ timeRangeType, from, to }),
      eventName: metric.event.value,
      ...paramHandler.getParams(),
    },
    joinSection,
    whereSection,
    breakdownSelect,
    breakdownBucketMinMaxQuery,
  };
};
