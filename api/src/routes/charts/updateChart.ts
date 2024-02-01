import { TRPCError } from "@trpc/server";
import { InferInsertModel, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { chartDataSchema } from "./createChart";
import { metricSchema } from "./getInsight";
import { ChartType, ReportType } from "../../app-router-type";

export const updateChart = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      projectId: z.string(),
      updateData: z.object({
        title: z.string().optional(),
        chartType: z.nativeEnum(ChartType).optional(),
        reportType: z.nativeEnum(ReportType).optional(),
        description: z.string().optional(),
        metrics: z.array(metricSchema).optional(),
        data: chartDataSchema.optional(),
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
