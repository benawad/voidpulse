import { z } from "zod";
import {
  DataType,
  FilterAndOr,
  MetricMeasurement,
  PropOrigin,
} from "../../../app-router-type";

export const eventFilterSchema = z.object({
  id: z.string(),
  propName: z.string(),
  operation: z.number().int().optional(),
  dataType: z.nativeEnum(DataType),
  propOrigin: z.nativeEnum(PropOrigin),
  value: z.any().optional(),
  value2: z.any().optional(),
});

export const eventSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const metricSchema = z.object({
  id: z.string(),
  event: eventSchema,
  type: z.nativeEnum(MetricMeasurement).optional(),
  andOr: z.nativeEnum(FilterAndOr).optional(),
  filters: z.array(eventFilterSchema),
});

export type MetricFilter = z.infer<typeof eventFilterSchema>;
export type InputMetric = z.infer<typeof metricSchema>;
