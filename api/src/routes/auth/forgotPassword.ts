import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../../trpc";
import {
  checkForgotPasswordCode,
  sendForgotPasswordEmail,
} from "../../utils/email/sendForgotPasswordEmail";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { users } from "../../schema/users";

export const forgotPassword = publicProcedure
  .input(
    z.object({
      email: z.string().min(3).max(255),
    })
  )
  .mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email.toLowerCase()),
    });

    if (user) {
      await sendForgotPasswordEmail(user.email, user.id);
    }

    return {
      ok: true,
    };
  });
