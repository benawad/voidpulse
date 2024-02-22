import { InferInsertModel, and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { charts } from "../../schema/charts";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { boards } from "../../schema/boards";

export const deleteChart = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      boardId: z.string(),
      chartId: z.string(),
    })
  )
  .mutation(
    async ({ input: { projectId, boardId, chartId }, ctx: { userId } }) => {
      await assertProjectMember({ projectId, userId });

      await db
        .delete(charts)
        .where(and(eq(charts.id, chartId), eq(charts.projectId, projectId)));

      const board = await db.query.boards.findFirst({
        where: eq(boards.id, boardId),
      });

      if (!board || !board.positions) {
        return {
          board: null,
        };
      }

      const setData: Partial<InferInsertModel<typeof boards>> = {};

      const rowIdx = board.positions.findIndex((row) =>
        row.cols.find((x) => x.chartId === chartId)
      );

      if (rowIdx === -1) {
        return {
          board: null,
        };
      }

      setData.positions = board.positions
        .map((row, idx) => {
          if (idx === rowIdx) {
            const newCols = row.cols.filter((x) => x.chartId !== chartId);
            return {
              ...row,
              cols: newCols.map((col) => ({
                ...col,
                width: Math.floor(100 / newCols.length),
              })),
            };
          }
          return row;
        })
        .filter((row) => row.cols.length);

      const [newBoard] = await db
        .update(boards)
        .set(setData)
        .where(eq(boards.id, boardId))
        .returning();

      return { board: newBoard };
    }
  );
