import { TRPCError } from "@trpc/server";
import argon2d from "argon2";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { __cloud__ } from "../../constants/prod";
import { db } from "../../db";
import { users } from "../../schema/users";
import { publicProcedure } from "../../trpc";
import { sendAuthCookies } from "../../utils/createAuthTokens";
import { getProjects } from "../../utils/getProjects";
import { selectUserFields } from "../../utils/selectUserFields";

export const login = publicProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User not found",
      });
    }

    if (!user.passwordHash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Click 'Forgot password?' to set a password.",
      });
    }

    try {
      const valid = await argon2d.verify(user.passwordHash, input.password);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid password",
        });
      }
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message,
      });
    }

    if (__cloud__ && !user.confirmed) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Check your email for a confirmation email.",
      });
    }

    sendAuthCookies(ctx.res, user);

    return {
      user: selectUserFields(user),
      projects: await getProjects(user.id),
    };
  });
