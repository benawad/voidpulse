import { z } from "zod";
import {
  AggType,
  DataType,
  FilterAndOr,
  MetricMeasurement,
  NumOperation,
  PropOrigin,
} from "../../../app-router-type";

export const eventPropSchema = z.object({
  name: z.string(),
  value: z.string(),
});

export const eventFilterSchema = z.object({
  id: z.string(),
  prop: eventPropSchema,
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
  typeAgg: z.nativeEnum(AggType).optional(),
  typeProp: z
    .object({
      name: z.string(),
      value: z.string(),
      propOrigin: z.nativeEnum(PropOrigin),
    })
    .optional(),
  andOr: z.nativeEnum(FilterAndOr).optional(),
  filters: z.array(eventFilterSchema),
  fbCampaignIds: z.array(z.string()).optional(),
});

export const eventCombinationSchema = z.object({
  eventIdx1: z.number().int(),
  eventIdx2: z.number().int(),
  operation: z.nativeEnum(NumOperation),
});

export type MetricFilter = z.infer<typeof eventFilterSchema>;
export type InputMetric = z.infer<typeof metricSchema>;
