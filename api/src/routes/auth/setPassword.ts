import { TRPCError } from "@trpc/server";
import argon2d from "argon2";
import { z } from "zod";
import { __cloud__ } from "../../constants/prod";
import { DbUser, db } from "../../db";
import { users } from "../../schema/users";
import { publicProcedure } from "../../trpc";
import { sendAuthCookies } from "../../utils/createAuthTokens";
import { sendConfirmationEmail } from "../../utils/email/sendConfirmationEmail";
import { initNewUser } from "../../utils/initNewUser";
import { selectUserFields } from "../../utils/selectUserFields";
import { checkForgotPasswordCode } from "../../utils/email/sendForgotPasswordEmail";
import { eq } from "drizzle-orm";
import { projectUsers } from "../../schema/project-users";
import { projects } from "../../schema/projects";
import { getProjects } from "../../utils/getProjects";

export const setPassword = publicProcedure
  .input(
    z.object({
      code: z.string(),
      password: z.string().min(6).max(255),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const userId = await checkForgotPasswordCode(input.code);
    if (!userId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invalid or expired code",
      });
    }

    const [user] = await db
      .update(users)
      .set({
        passwordHash: await argon2d.hash(input.password),
      })
      .where(eq(users.id, userId))
      .returning();

    sendAuthCookies(ctx.res, user);

    return {
      user: selectUserFields(user),
      projects: await getProjects(user.id),
    };
  });
