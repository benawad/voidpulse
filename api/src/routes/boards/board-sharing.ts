import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { v4 } from "uuid";
import { db } from "../../db";
import { boards } from "../../schema/boards";
import { charts } from "../../schema/charts";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const generateShareToken = protectedProcedure
  .input(
    z.object({
      boardId: z.string(),
      projectId: z.string(),
    })
  )
  .mutation(async ({ input: { boardId, projectId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.projectId, projectId)),
    });

    if (!board) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    // Generate a new share token
    const shareToken = v4();

    const [updatedBoard] = await db
      .update(boards)
      .set({ shareToken })
      .where(eq(boards.id, boardId))
      .returning();

    return { shareToken: updatedBoard.shareToken };
  });

export const disableSharing = protectedProcedure
  .input(
    z.object({
      boardId: z.string(),
      projectId: z.string(),
    })
  )
  .mutation(async ({ input: { boardId, projectId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, boardId), eq(boards.projectId, projectId)),
    });

    if (!board) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const [updatedBoard] = await db
      .update(boards)
      .set({ shareToken: null })
      .where(eq(boards.id, boardId))
      .returning();

    return { success: true };
  });

export const getSharedBoard = publicProcedure
  .input(
    z.object({
      shareToken: z.string(),
    })
  )
  .query(async ({ input: { shareToken } }) => {
    const board = await db.query.boards.findFirst({
      where: eq(boards.shareToken, shareToken),
      with: {
        project: true,
        creator: {
          columns: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!board) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Shared board not found or sharing is disabled",
      });
    }

    // Get charts for this board
    const boardCharts = await db.query.charts.findMany({
      where: eq(charts.boardId, board.id),
    });

    return {
      board: {
        id: board.id,
        title: board.title,
        description: board.description,
        emoji: board.emoji,
        positions: board.positions,
        project: {
          id: board.project.id,
          name: board.project.name,
        },
        creator: {
          id: board.creator.id,
          email: board.creator.email,
        },
      },
      charts: boardCharts,
    };
  });
