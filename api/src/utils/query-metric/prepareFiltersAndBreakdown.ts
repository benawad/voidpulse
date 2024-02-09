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
import { filtersToSql } from "../filtersToSql";
import { getDateRange } from "../getDateRange";

export const prepareFiltersAndBreakdown = async ({
  metric,
  globalFilters,
  breakdowns,
  projectId,
  timeRangeType,
  from,
  to,
}: {
  projectId: string;
  from?: string;
  to?: string;
  timeRangeType: ChartTimeRangeType;
  metric: InputMetric;
  globalFilters: MetricFilter[];
  breakdowns: MetricFilter[];
}) => {
  const { paramMap, whereStrings, paramCount, needsPeopleJoin } = filtersToSql(
    [...metric.filters, ...globalFilters],
    1
  );
  const whereCombiner = metric.andOr === FilterAndOr.or ? " OR " : " AND ";
  const query_params: any = {
    projectId,
    ...getDateRange(timeRangeType, from, to),
    eventName: metric.event.value,
    ...paramMap,
  };
  const joinSection =
    needsPeopleJoin ||
    (breakdowns.length && breakdowns[0].propOrigin === PropOrigin.user)
      ? `inner join people as p on e.distinct_id = p.distinct_id `
      : "";
  const whereSection = `
  project_id = {projectId:UUID}
    AND time >= {from:DateTime}
    AND time <= {to:DateTime}
    ${
      metric.event.value !== ANY_EVENT_VALUE
        ? `AND name = {eventName:String}`
        : ``
    }
    ${whereStrings.length ? `AND ${whereStrings.join(whereCombiner)}` : ""}
    `;
  let breakdownSelect = "";
  let breakdownBucketMinMaxQuery = "";
  let shouldBucketData = false;
  if (breakdowns.length) {
    const b = breakdowns[0];
    const jsonExtractor = {
      [DataType.string]: `JSONExtractString`,
      [DataType.number]: `JSONExtractFloat`,
      [DataType.boolean]: `JSONExtractBool`,
      [DataType.date]: `JSONExtractString`,
      [DataType.other]: ``,
    }[b.dataType];
    if (jsonExtractor) {
      query_params[`p${paramCount + 1}`] = b.propName;
      breakdownSelect = `${jsonExtractor}(${
        b.propOrigin === PropOrigin.user ? "p" : "e"
      }.properties, {p${paramCount + 1}:String})`;
    }
    if (b.dataType === DataType.number) {
      const query = `
      select count(distinct ${breakdownSelect}) > 10 as shouldBucket
      from events as e
      ${joinSection}
      where ${whereSection}`;
      if (!__prod__) {
        console.log(query);
      }
      const resp0 = await clickhouse.query({
        query,
        query_params,
      });
      const {
        data: [r0],
      } = await resp0.json<
        ClickHouseQueryResponse<{ shouldBucket: boolean }>
      >();
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
        const bucket_start = `min_breakdown + ${breakdownBucketSize} * (${bucket_idx} - 1)`;
        const bucket_end = `${bucket_start} + ${breakdownBucketSize}`;
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
    query_params,
    joinSection,
    whereSection,
    breakdownSelect,
    breakdownBucketMinMaxQuery,
  };
};
