import { z } from "zod";
import { db } from "../../db";
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
import { v4 } from "uuid";

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
          dataUpdatedAt: new Date(),
          ...fields,
        })
        .returning();
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
        setData.positions = [
          {
            rowId: v4(),
            height: 400,
            cols: [
              {
                chartId: chart.id,
                width: 100,
              },
            ],
          },
        ];
      } else if (board.positions[boardIdx]) {
        if (board.positions[boardIdx].cols.length === 4) {
          setData.positions = [
            ...board.positions.slice(0, boardIdx),
            {
              rowId: v4(),

              height: 400,
              cols: [
                {
                  chartId: chart.id,
                  width: 100,
                },
              ],
            },
            ...board.positions.slice(boardIdx),
          ];
        } else {
          setData.positions = board.positions.map((row, idx) =>
            idx === boardIdx
              ? {
                  ...row,
                  cols: [
                    ...row.cols.map((col) => ({
                      ...col,
                      width: Math.floor(100 / (row.cols.length + 1)),
                    })),
                    {
                      chartId: chart.id,
                      width: Math.floor(100 / (row.cols.length + 1)),
                    },
                  ],
                }
              : row
          );
        }
      } else {
        setData.positions = [
          ...board.positions,
          {
            rowId: v4(),
            height: 400,
            cols: [
              {
                chartId: chart.id,
                width: 100,
              },
            ],
          },
        ];
      }

      const [newBoard] = await db
        .update(boards)
        .set(setData)
        .where(eq(boards.id, boardId))
        .returning();

      return { chart, board: newBoard };
    }
  );
