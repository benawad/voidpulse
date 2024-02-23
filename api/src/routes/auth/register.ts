import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { DbUser, db } from "../../db";
import { users } from "../../schema/users";
import argon2d from "argon2";
import { sendAuthCookies } from "../../utils/createAuthTokens";
import { projects } from "../../schema/projects";
import { genApiKey } from "../../utils/genApiKey";
import { projectUsers } from "../../schema/project-users";
import { boards } from "../../schema/boards";
import * as emoji from "node-emoji";
import { TRPCError } from "@trpc/server";
import { selectUserFields } from "../../utils/selectUserFields";
import { v4 } from "uuid";

export const register = publicProcedure
  .input(
    z.object({
      email: z.string().min(3).max(255),
      password: z.string().min(6).max(255),
    })
  )
  .mutation(async ({ input, ctx }) => {
    let newUser: DbUser;

    try {
      newUser = (
        await db
          .insert(users)
          .values({
            email: input.email,
            passwordHash: await argon2d.hash(input.password),
          })
          .returning()
      )[0];
    } catch (e) {
      if (
        e.message.includes(
          'duplicate key value violates unique constraint "users_email_unique"'
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already exists",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: e.message,
      });
    }

    const boardId = v4();
    const [project] = await db
      .insert(projects)
      .values({
        name: "My First Project",
        apiKey: genApiKey(),
        boardOrder: [boardId],
      })
      .returning();

    await db.insert(projectUsers).values({
      projectId: project.id,
      userId: newUser.id,
    });

    const [board] = await db
      .insert(boards)
      .values({
        id: boardId,
        creatorId: newUser.id,
        emoji: emoji.random().emoji,
        title: "My First Board",
        projectId: project.id,
      })
      .returning();

    sendAuthCookies(ctx.res, newUser);

    return {
      user: selectUserFields(newUser),
      projects: [project],
      boards: [board],
    };
  });
