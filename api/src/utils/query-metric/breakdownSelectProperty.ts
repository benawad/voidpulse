import { DataType, PropOrigin } from "../../app-router-type";
import { MetricFilter } from "../../routes/charts/insight/eventFilterSchema";
import { QueryParamHandler } from "./QueryParamHandler";

export const breakdownSelectProperty = (
  b: MetricFilter,
  paramHandler: QueryParamHandler
) => {
  const jsonExtractor = {
    [DataType.string]: `JSONExtractString`,
    [DataType.number]: `JSONExtractFloat`,
    [DataType.boolean]: `JSONExtractBool`,
    [DataType.date]: `JSONExtractString`,
    [DataType.array]: ``,
    [DataType.other]: ``,
  }[b.dataType];
  if (jsonExtractor) {
    return {
      select: `${jsonExtractor}(${
        b.propOrigin === PropOrigin.user ? "p" : "e"
      }.properties, {${paramHandler.add(b.prop.value)}:String})`,
      join: "",
    };
  }

  if (b.dataType === DataType.array) {
    return {
      select: `breakdown`,
      join: `ARRAY JOIN ${`JSONExtractArrayRaw(${
        b.propOrigin === PropOrigin.user ? "p" : "e"
      }.properties, {${paramHandler.add(b.prop.value)}:String})`} AS breakdown`,
    };
  }

  return {
    select: "",
    join: "",
  };
};
