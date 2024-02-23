import { and, eq, InferInsertModel, is, sql } from "drizzle-orm";
import * as emoji from "node-emoji";
import { z } from "zod";
import { db } from "../../db";
import { boards } from "../../schema/boards";
import { protectedProcedure } from "../../trpc";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { TRPCError } from "@trpc/server";
import { projects } from "../../schema/projects";
import { isUuidV4 } from "../../utils/isUuid";

export const updateBoardOrder = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      boardOrder: z.array(z.string().uuid()),
    })
  )
  .mutation(async ({ input: { projectId, boardOrder }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    await db
      .update(projects)
      .set({ boardOrder })
      .where(eq(projects.id, projectId));

    return { ok: true };
  });

export const getBoards = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input: { projectId }, ctx: { userId } }) => {
    if (!isUuidV4(projectId)) {
      return {
        boards: [],
      };
    }

    const dashboards = await db.query.boards.findMany({
      where: and(eq(boards.projectId, projectId), eq(boards.creatorId, userId)),
    });

    return {
      boards: dashboards,
    };
  });

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
    await db.execute(sql`
    UPDATE projects
    SET board_order = COALESCE(board_order, '[]'::jsonb) || ${JSON.stringify([board.id])}::jsonb
    WHERE id = ${projectId};
    `);

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
        positions: z
          .array(
            z.object({
              rowId: z.string(),
              height: z.number(),
              cols: z.array(
                z.object({
                  width: z.number(),
                  chartId: z.string(),
                })
              ),
            })
          )
          .optional(),
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
      projectId: z.string(),
      id: z.string(),
    })
  )
  .mutation(async ({ input: { id, projectId }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });

    await db
      .delete(boards)
      .where(
        and(
          eq(boards.id, id),
          eq(boards.creatorId, userId),
          eq(boards.projectId, projectId)
        )
      );
    await db.execute(sql`
      UPDATE projects
      SET board_order = (
        SELECT jsonb_agg(elem)
        FROM jsonb_array_elements_text(board_order) AS t(elem)
        WHERE elem <> ${id}
      )
      WHERE id = ${projectId};
      `);

    return {
      ok: true,
    };
  });
