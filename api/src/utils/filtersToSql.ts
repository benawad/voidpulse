import { DataType, DateFilterKey, NumberFilterKey } from "../app-router-type";
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
      if (typeof filter.value !== "number") {
        continue;
      }
      if (
        filter.operation === NumberFilterKey.between ||
        filter.operation === NumberFilterKey.notBetween
      ) {
        if (typeof filter.value2 !== "number") {
          continue;
        }
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
        paramMap[`p${paramCount + 3}`] = filter.value2;
        const operator =
          filter.operation === NumberFilterKey.between
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
        filter.operation === NumberFilterKey.isNumeric ||
        filter.operation === NumberFilterKey.isNotNumeric
      ) {
        paramMap[`p${paramCount + 1}`] = filter.propName;
        const operator = {
          [NumberFilterKey.isNumeric]: "IS NOT NULL",
          [NumberFilterKey.isNotNumeric]: "IS NULL",
        }[filter.operation];
        whereStrings.push(
          `JSONExtractFloat(${propertiesName}, {p${
            paramCount + 1
          }:String}) ${operator}`
        );
        paramCount += 1;
      } else {
        paramMap[`p${paramCount + 1}`] = filter.propName;
        paramMap[`p${paramCount + 2}`] = filter.value;
        const operator = {
          [NumberFilterKey.equals]: "=",
          [NumberFilterKey.notEqual]: "!=",
          [NumberFilterKey.greaterThan]: ">",
          [NumberFilterKey.greaterThanOrEqual]: ">=",
          [NumberFilterKey.lessThan]: "<",
          [NumberFilterKey.lessThanOrEqual]: "<=",
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
    }
  }

  return {
    whereStrings,
    paramMap,
    paramCount,
  };
};
