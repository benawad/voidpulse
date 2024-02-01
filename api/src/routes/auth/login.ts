import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { DbBoard, DbProject, db } from "../../db";
import { eq, ilike } from "drizzle-orm";
import { users } from "../../schema/users";
import argon2d from "argon2";
import { __prod__ } from "../../constants/prod";
import { sendAuthCookies } from "../../utils/createAuthTokens";
import { projects } from "../../schema/projects";
import { projectUsers } from "../../schema/project-users";
import { boards } from "../../schema/boards";
import { TRPCError } from "@trpc/server";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await db.query.users.findFirst({
      where: ilike(users.email, input.email),
    });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User not found"
      })
    }

    try {
      const valid = await argon2d.verify(user.passwordHash, input.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password"
        })
      }
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message
      })
    }

    sendAuthCookies(ctx.res, user);

    // TODO: is it possible for projectId to be null? should i throw an error?
    const projectUser = await db.query.projectUsers.findFirst({
      where: eq(projectUsers.userId, user.id),
      columns: {
        projectId: true
      }
    });

    let project: DbProject | undefined;
    if (projectUser) {
      // TODO: can it be a dangling relation? should i throw an error if it's the case?
      project = await db.query.projects.findFirst({
        where: eq(projects.id, projectUser.projectId)
      });
    }

    let board: DbBoard | undefined;
    if (project) {
      board = await db.query.boards.findFirst({
        where: eq(boards.projectId, project.id as string)
      });
    }

    return {
      user: {
        id: user.id,
      },
      project,
      board,
    };
  });
