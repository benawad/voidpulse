import { z } from "zod";
import { db } from "../../db";
import { boardCharts } from "../../schema/board-charts";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { metricSchema } from "./insight/eventFilterSchema";
import { updateChartDataSchemaFields } from "./updateChart";
import {
  ChartTimeRangeType,
  ChartType,
  ReportType,
} from "../../app-router-type";
import { chartDataSchema } from "./chartDataSchema";
import { InferInsertModel, eq } from "drizzle-orm";
import { boards } from "../../schema/boards";
import { TRPCError } from "@trpc/server";

export const createChart = protectedProcedure
  .input(
    z.object({
      ...updateChartDataSchemaFields,
      projectId: z.string(),
      boardId: z.string(),
      boardIdx: z.number(),
      metrics: z.array(metricSchema),
      data: chartDataSchema,
    })
  )
  .mutation(
    async ({
      input: {
        chartType = ChartType.line,
        timeRangeType = ChartTimeRangeType["30D"],
        reportType = ReportType.insight,
        projectId,
        boardId,
        boardIdx,
        ...fields
      },
      ctx: { userId },
    }) => {
      await assertProjectMember({ projectId, userId });

      const [chart] = await db
        .insert(charts)
        .values({
          creatorId: userId,
          projectId,
          boardId,
          chartType,
          timeRangeType,
          reportType,
          ...fields,
        })
        .returning();
      await db.insert(boardCharts).values({ boardId, chartId: chart.id });
      const board = await db.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });
      if (!board) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Board not found",
        });
      }

      const setData: Partial<InferInsertModel<typeof boards>> = {};

      if (!board.positions) {
        setData.positions = [[chart.id]];
        setData.widths = [[100]];
        setData.heights = [400];
      } else if (board.positions[boardIdx]) {
        if (board.positions[boardIdx].length === 4) {
          setData.positions = [
            ...board.positions.slice(0, boardIdx),
            [chart.id],
            ...board.positions.slice(boardIdx),
          ];
          setData.widths = [
            ...board.widths!.slice(0, boardIdx),
            [100],
            ...board.widths!.slice(boardIdx),
          ];
          setData.heights = [
            ...board.heights!.slice(0, boardIdx),
            400,
            ...board.heights!.slice(boardIdx),
          ];
        } else {
          setData.positions = board.positions.map((row, idx) =>
            idx === boardIdx ? [...row, chart.id] : row
          );
          setData.widths = board.widths!.map((row, idx) =>
            idx === boardIdx
              ? Array(row.length + 1).fill(Math.floor(100 / (row.length + 1)))
              : row
          );
        }
      } else {
        setData.positions = [...board.positions, [chart.id]];
        setData.widths = [...board.widths!, [100]];
        setData.heights = [...board.heights!, 400];
      }

      const [newBoard] = await db
        .update(boards)
        .set(setData)
        .where(eq(boards.id, boardId))
        .returning();

      return { chart, board: newBoard };
    }
  );
