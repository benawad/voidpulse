import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { db } from "../../db";
import { ilike } from "drizzle-orm";
import { users } from "../../schema/users";
import argon2d from "argon2";
import { __prod__ } from "../../constants/prod";
import { sendAuthCookies } from "../../utils/createAuthTokens";

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
      return {
        error: "User not found",
      };
    }

    try {
      const valid = await argon2d.verify(user.passwordHash, input.password);
      if (!valid) {
        return {
          error: "Invalid password",
        };
      }
    } catch {
      return {
        error: "Something went wrong",
      };
    }

    sendAuthCookies(ctx.res, user);

    return {
      ok: true,
    };
  });
