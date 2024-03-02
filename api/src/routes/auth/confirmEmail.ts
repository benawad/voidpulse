import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { __cloud__ } from "../../constants/prod";
import { db } from "../../db";
import { users } from "../../schema/users";
import { publicProcedure } from "../../trpc";
import { sendAuthCookies } from "../../utils/createAuthTokens";
import { checkConfirmationCode } from "../../utils/email/sendConfirmationEmail";
import { initNewUser } from "../../utils/initNewUser";
import { isUuidV4 } from "../../utils/isUuid";
import { selectUserFields } from "../../utils/selectUserFields";

export const confirmEmail = publicProcedure
  .input(
    z.object({
      code: z.string(),
      timezone: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!__cloud__) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "This is for cloud only",
      });
    }

    if (!isUuidV4(input.code)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid code",
      });
    }

    const userId = await checkConfirmationCode(input.code);

    if (!userId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid code",
      });
    }

    const [user] = await db
      .update(users)
      .set({
        confirmed: true,
      })
      .where(eq(users.id, userId))
      .returning();

    const { project, board } = await initNewUser(user.id, input.timezone);
    sendAuthCookies(ctx.res, user);

    return {
      user: selectUserFields(user),
      projects: [project],
      boards: [board],
    };
  });
