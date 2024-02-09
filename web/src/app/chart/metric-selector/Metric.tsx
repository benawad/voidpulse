import { RouterInput } from "../../utils/trpc";

export type MetricFilter = RouterInput["getReport"]["metrics"][0]["filters"][0];

export type Metric = RouterInput["getReport"]["metrics"][0] & { id: string };
