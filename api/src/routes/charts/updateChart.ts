import { TRPCError } from "@trpc/server";
import { InferInsertModel, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { chartDataSchema } from "./chartDataSchema";
import { metricSchema } from "./insight/eventFilterSchema";
import {
  ChartTimeRangeType,
  ChartType,
  LineChartGroupByTimeType,
  ReportType,
  RetentionNumFormat,
} from "../../app-router-type";

export const updateChartDataSchemaFields = {
  title: z.string().optional(),
  visibleDataMap: z.record(z.boolean()).nullable().optional(),
  chartType: z.nativeEnum(ChartType).optional(),
  reportType: z.nativeEnum(ReportType).optional(),
  description: z.string().optional(),
  metrics: z.array(metricSchema).optional(),
  lineChartGroupByTimeType: z.nativeEnum(LineChartGroupByTimeType).optional(),
  data: chartDataSchema.optional(),
  timeRangeType: z.nativeEnum(ChartTimeRangeType).optional(),
  retentionNumFormat: z.nativeEnum(RetentionNumFormat).optional().nullable(),
  from: z.string().optional(),
  to: z.string().optional(),
};

export const updateChart = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      projectId: z.string(),
      updateData: z.object({
        ...updateChartDataSchemaFields,
      }),
    })
  )
  .mutation(
    async ({ input: { projectId, id, updateData }, ctx: { userId } }) => {
      await assertProjectMember({ projectId, userId });

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Empty update",
        });
      }

      const setData: Partial<InferInsertModel<typeof charts>> = updateData;
      if (setData.metrics || setData.data) {
        setData.dataUpdatedAt = new Date().toISOString();
      }

      const [chart] = await db
        .update(charts)
        .set(setData)
        .where(eq(charts.id, id))
        .returning();

      return { chart };
    }
  );
