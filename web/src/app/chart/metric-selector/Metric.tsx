import { RouterInput } from "../../utils/trpc";

export type MetricFilter =
  RouterInput["getInsight"]["metrics"][0]["filters"][0];

export type Metric = RouterInput["getInsight"]["metrics"][0] & { id: string };
