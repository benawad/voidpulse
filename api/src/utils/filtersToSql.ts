import {
  DataType,
  DateFilterOperation,
  NumberFilterOperation,
  StringFilterOperation,
} from "../app-router-type";
import { __prod__ } from "../constants/prod";
import { InputMetric } from "../routes/charts/insight/eventFilterSchema";

export const filtersToSql = (
  filters: InputMetric["filters"][0][],
  paramStartingCount = 1
) => {
  let paramCount = paramStartingCount;
  const whereStrings: string[] = [];
  const paramMap: Record<string, any> = {};
  for (const filter of filters) {
    const propertiesName = "properties";
    if (filter.dataType === DataType.number) {
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
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
        paramMap[`p${paramCount + 3}`] = filter.value2;
        const operator =
          filter.operation === NumberFilterOperation.between
            ? "BETWEEN"
            : "NOT BETWEEN";
        whereStrings.push(
          `JSONExtractFloat(${propertiesName}, {p${
            paramCount + 1
          }:String}) ${operator} {p${paramCount + 2}:Float64} and {p${
            paramCount + 3
          }:Float64}`
        );
        paramCount += 3;
      } else if (
        filter.operation === NumberFilterOperation.isNumeric ||
        filter.operation === NumberFilterOperation.isNotNumeric
      ) {
        paramMap[`p${paramCount + 1}`] = filter.propName;
        const operator = {
          [NumberFilterOperation.isNumeric]: "IS NOT NULL",
          [NumberFilterOperation.isNotNumeric]: "IS NULL",
        }[filter.operation];
        whereStrings.push(
          `JSONExtractFloat(${propertiesName}, {p${
            paramCount + 1
          }:String}) ${operator}`
        );
        paramCount += 1;
      } else {
        if (typeof filter.value !== "number") {
          continue;
        }
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
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
          `JSONExtractFloat(${propertiesName}, {p${
            paramCount + 1
          }:String}) ${operator} {p${paramCount + 2}:Float64}`
        );
        paramCount += 2;
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
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
        paramMap[`p${paramCount + 3}`] = filter.value2;
        const operator =
          filter.operation === DateFilterOperation.between
            ? "BETWEEN"
            : "NOT BETWEEN";
        whereStrings.push(
          `parseDateTimeBestEffortOrNull(JSONExtractString(${propertiesName}, {p${
            paramCount + 1
          }:String})) ${operator} {p${paramCount + 2}:DateTime} and {p${
            paramCount + 3
          }:DateTime}`
        );
        paramCount += 3;
      } else {
        if (typeof filter.value !== "string") {
          continue;
        }
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
        const operator = {
          [DateFilterOperation.on]: "=",
          [DateFilterOperation.notOn]: "!=",
          [DateFilterOperation.before]: "<",
          [DateFilterOperation.since]: ">=",
        }[filter.operation];
        if (!operator) {
          continue;
        }
        let left = `parseDateTimeBestEffortOrNull(JSONExtractString(${propertiesName}, {p${
          paramCount + 1
        }:String}))`;
        let right = `{p${paramCount + 2}:DateTime}`;

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
        paramMap[`p${paramCount + 1}`] = filter.propName;
        const operator = {
          [StringFilterOperation.isSet]: "IS NOT NULL",
          [StringFilterOperation.isNotSet]: "IS NULL",
        }[filter.operation];
        whereStrings.push(
          `JSONExtractString(${propertiesName}, {p${
            paramCount + 1
          }:String}) ${operator}`
        );
        paramCount += 1;
      } else if (
        filter.operation === StringFilterOperation.contains ||
        filter.operation === StringFilterOperation.notContains
      ) {
        if (typeof filter.value !== "string") {
          continue;
        }
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
        whereStrings.push(
          `JSONExtractString(${propertiesName}, {p${paramCount + 1}:String}) ${
            filter.operation === StringFilterOperation.contains
              ? "LIKE"
              : "NOT LIKE"
          } '%' || {p${paramCount + 2}:String} || '%'`
        );
        paramCount += 2;
      } else {
        if (!Array.isArray(filter.value)) {
          continue;
        }
        if (!filter.value.every((x) => typeof x === "string")) {
          continue;
        }
        whereStrings.push(
          `JSONExtractString(${propertiesName}, {p${
            paramCount + 1
          }:String}) IN (${filter.value
            .map((_, i) => `{p${paramCount + 2 + i}:String}`)
            .join(", ")})`
        );
        filter.value.forEach((x, i) => {
          paramMap[`p${paramCount + 2 + i}`] = x;
        });
        paramCount += 1 + filter.value.length;
      }
    } else if (filter.dataType === DataType.boolean) {
      if (typeof filter.value !== "boolean") {
        continue;
      }
      paramMap[`p${paramCount + 1}`] = filter.propName;
      paramMap[`p${paramCount + 2}`] = filter.value;
      whereStrings.push(
        `JSONExtractBoolean(${propertiesName}, {p${
          paramCount + 1
        }:String}, false) = {p${paramCount + 2}:Boolean}`
      );
      paramCount += 2;
    } else {
      if (!__prod__) {
        console.error(`Not implemented filter data type: ${filter.dataType}`);
      }
      continue;
    }
  }

  return {
    whereStrings,
    paramMap,
    paramCount,
  };
};
