import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { db } from "../../db";
import { ilike } from "drizzle-orm";
import { users } from "../../schema/users";
import argon2d from "argon2";
import { __prod__ } from "../../constants/prod";
import { sendAuthCookies } from "../../utils/createAuthTokens";
import { TRPCError } from "@trpc/server";
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
      where: ilike(users.email, input.email),
    });

    if (!user) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User not found",
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

    sendAuthCookies(ctx.res, user);

    return {
      user: selectUserFields(user),
    };
  });
