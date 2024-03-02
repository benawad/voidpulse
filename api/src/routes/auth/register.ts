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
import { ProjectRoleId } from "../../app-router-type";

export const register = publicProcedure
  .input(
    z.object({
      email: z.string().min(3).max(255),
      password: z.string().min(6).max(255),
      timezone: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    // @todo remove the `|| true` when launching
    if (!__cloud__ || true) {
      const user = await db.query.users.findFirst();
      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Only one user can be created in self-hosted mode (to prevent bad actors).",
        });
      }
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

    if (__cloud__) {
      await sendConfirmationEmail(newUser.email, newUser.id);
      return {
        user: selectUserFields(newUser),
      };
    } else {
      const { project, board } = await initNewUser(newUser.id, input.timezone);
      sendAuthCookies(ctx.res, newUser);

      return {
        user: selectUserFields(newUser),
        projects: [project],
        boards: [board],
      };
    }
  });
