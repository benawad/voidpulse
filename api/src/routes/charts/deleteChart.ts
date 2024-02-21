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

      const rowIdx = board.positions.findIndex((row) => row.includes(chartId));

      if (rowIdx === -1) {
        return {
          board: null,
        };
      }

      const rowLength = board.positions[rowIdx].length;

      setData.positions = board.positions
        .map((row, idx) =>
          idx === rowIdx ? row.filter((id) => id !== chartId) : row
        )
        .filter((row) => row.length);

      if (rowLength === 1) {
        setData.heights = board.heights?.filter((_, idx) => idx !== rowIdx);
        setData.widths = board.widths?.filter((_, idx) => idx !== rowIdx);
      } else {
        setData.widths = board.widths?.map((row, idx) =>
          idx === rowIdx
            ? Array(rowLength - 1).fill(Math.floor(100 / (rowLength - 1)))
            : row
        );
      }

      const [newBoard] = await db
        .update(boards)
        .set(setData)
        .where(eq(boards.id, boardId))
        .returning();

      return { board: newBoard };
    }
  );
