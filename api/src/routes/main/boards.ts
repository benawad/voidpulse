import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db";
import { boards } from "../../schema/boards";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const getBoards = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input: { projectId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const data = await db.query.boards.findMany({
      where: eq(boards.projectId, projectId),
    });

    return {
      boards: data,
    };
  });

export const createBoard = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ input: { projectId, name }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const [board] = await db
      .insert(boards)
      .values({ creatorId: userId, name, projectId })
      .returning();

    return { board };
  });

export const updateBoard = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  )
  .mutation(async ({ input: { id, name }, ctx: { userId } }) => {
    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, id), eq(boards.creatorId, userId)),
    });

    if (!board) {
      throw new Error("Board not found");
    }

    const [newBoard] = await db
      .update(boards)
      .set({ name })
      .where(eq(boards.id, id))
      .returning();

    return { board: newBoard };
  });

export const deleteBoard = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input: { id }, ctx: { userId } }) => {
    await db
      .delete(boards)
      .where(and(eq(boards.id, id), eq(boards.creatorId, userId)));

    return {
      ok: true,
    };
  });
