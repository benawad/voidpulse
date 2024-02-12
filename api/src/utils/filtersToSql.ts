import {
  DataType,
  DateFilterOperation,
  NumberFilterOperation,
  PropOrigin,
  StringFilterOperation,
} from "../app-router-type";
import { __prod__ } from "../constants/prod";
import { InputMetric } from "../routes/charts/insight/eventFilterSchema";
import { QueryParamHandler } from "./query-metric/QueryParamHandler";

export const filtersToSql = (
  filters: InputMetric["filters"][0][],
  paramHandler: QueryParamHandler
) => {
  let needsPeopleJoin = false;
  const whereStrings: string[] = [];
  for (const filter of filters) {
    const propertiesName =
      filter.propOrigin === PropOrigin.event ? "properties" : "p.properties";
    if (filter.propOrigin === PropOrigin.user) {
      needsPeopleJoin = true;
    }
    if (filter.dataType === DataType.number) {
      if (!filter.operation) {
        continue;
      }
      if (
        filter.operation === NumberFilterOperation.between ||
        filter.operation === NumberFilterOperation.notBetween
      ) {
        if (
          typeof filter.value !== "number" ||
          typeof filter.value2 !== "number"
        ) {
          continue;
        }
        const operator =
          filter.operation === NumberFilterOperation.between
            ? "BETWEEN"
            : "NOT BETWEEN";
        whereStrings.push(
          `JSONExtractFloat(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String}) ${operator} {${paramHandler.add(
            filter.value2
          )}:Float64} and {${paramHandler.add(filter.value2)}:Float64}`
        );
      } else if (
        filter.operation === NumberFilterOperation.isNumeric ||
        filter.operation === NumberFilterOperation.isNotNumeric
      ) {
        const operator = {
          [NumberFilterOperation.isNumeric]: "IS NOT NULL",
          [NumberFilterOperation.isNotNumeric]: "IS NULL",
        }[filter.operation];
        whereStrings.push(
          `JSONExtractFloat(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String}) ${operator}`
        );
      } else {
        if (typeof filter.value !== "number") {
          continue;
        }
        const operator = {
          [NumberFilterOperation.equals]: "=",
          [NumberFilterOperation.notEqual]: "!=",
          [NumberFilterOperation.greaterThan]: ">",
          [NumberFilterOperation.greaterThanOrEqual]: ">=",
          [NumberFilterOperation.lessThan]: "<",
          [NumberFilterOperation.lessThanOrEqual]: "<=",
        }[filter.operation];
        if (!operator) {
          continue;
        }
        whereStrings.push(
          `JSONExtractFloat(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String}) ${operator} {${paramHandler.add(filter.value)}:Float64}`
        );
      }
    } else if (filter.dataType === DataType.date) {
      if (
        filter.operation === DateFilterOperation.between ||
        filter.operation === DateFilterOperation.notBetween
      ) {
        if (
          typeof filter.value !== "string" ||
          typeof filter.value2 !== "string"
        ) {
          continue;
        }
        const operator =
          filter.operation === DateFilterOperation.between
            ? "BETWEEN"
            : "NOT BETWEEN";
        whereStrings.push(
          `parseDateTimeBestEffortOrNull(JSONExtractString(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String})) ${operator} {${paramHandler.add(
            filter.value
          )}:DateTime} and {${paramHandler.add(filter.value2)}:DateTime}`
        );
      } else {
        if (typeof filter.value !== "string" || !filter.operation) {
          continue;
        }
        const operator = {
          [DateFilterOperation.on]: "=",
          [DateFilterOperation.notOn]: "!=",
          [DateFilterOperation.before]: "<",
          [DateFilterOperation.since]: ">=",
        }[filter.operation];
        if (!operator) {
          continue;
        }
        let left = `parseDateTimeBestEffortOrNull(JSONExtractString(${propertiesName}, {${paramHandler.add(
          filter.prop.value
        )}:String}))`;
        let right = `{${paramHandler.add(filter.value)}:DateTime}`;

        if (
          filter.operation === DateFilterOperation.on ||
          filter.operation === DateFilterOperation.notOn
        ) {
          left = `toStartOfDay(${left})`;
          right = `toStartOfDay(${right})`;
        }

        whereStrings.push(`${left} ${operator} ${right}`);
      }
    } else if (filter.dataType === DataType.string) {
      if (
        filter.operation === StringFilterOperation.isSet ||
        filter.operation === StringFilterOperation.isNotSet
      ) {
        const operator = {
          [StringFilterOperation.isSet]: "IS NOT NULL",
          [StringFilterOperation.isNotSet]: "IS NULL",
        }[filter.operation];
        whereStrings.push(
          `JSONExtractString(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String}) ${operator}`
        );
      } else if (
        filter.operation === StringFilterOperation.contains ||
        filter.operation === StringFilterOperation.notContains
      ) {
        if (typeof filter.value !== "string") {
          continue;
        }
        whereStrings.push(
          `JSONExtractString(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String}) ${
            filter.operation === StringFilterOperation.contains
              ? "LIKE"
              : "NOT LIKE"
          } '%' || {${paramHandler.add(filter.value)}:String} || '%'`
        );
      } else if (
        filter.operation === StringFilterOperation.is ||
        filter.operation === StringFilterOperation.isNot
      ) {
        if (!Array.isArray(filter.value)) {
          continue;
        }
        if (!filter.value.every((x) => typeof x === "string")) {
          continue;
        }
        const operator = {
          [StringFilterOperation.is]: "IN",
          [StringFilterOperation.isNot]: "NOT IN",
        }[filter.operation];
        whereStrings.push(
          `JSONExtractString(${propertiesName}, {${paramHandler.add(
            filter.prop.value
          )}:String}) ${operator} (${filter.value
            .map((x) => `{${paramHandler.add(x)}:String}`)
            .join(", ")})`
        );
      }
    } else if (filter.dataType === DataType.boolean) {
      if (typeof filter.value !== "boolean") {
        continue;
      }
      whereStrings.push(
        `JSONExtractBool(${propertiesName}, {${paramHandler.add(
          filter.prop.value
        )}:String}, false) = {${paramHandler.add(filter.value)}:Bool}`
      );
    } else {
      if (!__prod__) {
        console.error(`Not implemented filter data type: ${filter.dataType}`);
      }
      continue;
    }
  }

  return {
    needsPeopleJoin,
    whereStrings,
  };
};
