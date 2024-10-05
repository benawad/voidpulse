import { TRPCError } from "@trpc/server";
import argon2d from "argon2";
import { z } from "zod";
import { __cloud__ } from "../../constants/prod";
import { DbUser, db } from "../../db";
import { users } from "../../schema/users";
import { protectedProcedure } from "../../trpc";
import { initNewUser } from "../../utils/initNewUser";
import { projectUsers } from "../../schema/project-users";
import { ProjectRoleId } from "../../app-router-type";
import { assertProjectMember } from "../../utils/assertProjectMember";

export const addUser = protectedProcedure
  .input(
    z.object({
      email: z.string().min(3).max(255),
      password: z.string().min(6).max(255),
      projectId: z.string().uuid(),
      timezone: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { role } = await assertProjectMember({
      projectId: input.projectId,
      userId: ctx.userId,
    });
    if (role !== ProjectRoleId.admin) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not an admin",
      });
    }

    let newUser: DbUser;

    try {
      newUser = (
        await db
          .insert(users)
          .values({
            email: input.email.toLowerCase(),
            passwordHash: await argon2d.hash(input.password),
          })
          .returning()
      )[0];
    } catch (e: any) {
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

    await initNewUser(newUser.id, input.timezone);

    await db.insert(projectUsers).values({
      projectId: input.projectId,
      userId: newUser.id,
      role: ProjectRoleId.editor,
      boardOrder: [],
    });

    return {
      ok: true,
    };
  });
