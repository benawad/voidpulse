import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { db } from "../../db";
import { users } from "../../schema/users";
import argon2d from "argon2";
import { sendAuthCookies } from "../../utils/createAuthTokens";

export const register = publicProcedure
  .input(
    z.object({
      email: z.string().min(3).max(255),
      password: z.string().min(6).max(255),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const user = await db.query.users.findFirst();
    if (user) {
      return {
        error: "User already exists",
      };
    }

    const [newUser] = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash: await argon2d.hash(input.password),
      })
      .returning();

    sendAuthCookies(ctx.res, newUser);

    return {
      user: {
        id: newUser.id,
      },
    };
  });
