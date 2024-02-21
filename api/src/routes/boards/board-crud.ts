import { and, eq, InferInsertModel } from "drizzle-orm";
import * as emoji from "node-emoji";
import { z } from "zod";
import { db } from "../../db";
import { boards } from "../../schema/boards";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { TRPCError } from "@trpc/server";

export const createBoard = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      title: z.string(),
    })
  )
  .mutation(async ({ input: { projectId, title }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    const [board] = await db
      .insert(boards)
      .values({ creatorId: userId, title, projectId })
      .returning();

    return { board };
  });

export const updateBoard = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        randomEmoji: z.boolean().optional(),
        positions: z.array(z.array(z.string())).optional(),
        heights: z.array(z.number()).optional(),
        widths: z.array(z.array(z.number())).optional(),
      }),
    })
  )
  .mutation(async ({ input: { id, data }, ctx: { userId } }) => {
    if (Object.keys(data).length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Empty update",
      });
    }

    const board = await db.query.boards.findFirst({
      where: and(eq(boards.id, id), eq(boards.creatorId, userId)),
    });

    if (!board) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Board not found",
      });
    }

    const { randomEmoji, ...values } = data;

    const setData: Partial<InferInsertModel<typeof boards>> = values;

    if (randomEmoji) {
      setData.emoji = emoji.random().emoji;
    }

    const [newBoard] = await db
      .update(boards)
      .set(setData)
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
