import { AggType } from "../../app-router-type";

export const getAggFn = (typeAgg: AggType) => {
  return {
    [AggType.avg]: "avg",
    [AggType.median]: "median",
    [AggType.percentile25]: "quantile(0.25)",
    [AggType.percentile75]: "quantile(0.75)",
    [AggType.percentile90]: "quantile(0.90)",
    [AggType.min]: "min",
    [AggType.max]: "max",
  }[typeAgg];
};
