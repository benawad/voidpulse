import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../schema/users";
import { publicProcedure } from "../../trpc";
import { checkTokens } from "../../utils/createAuthTokens";

export const getMe = publicProcedure.query(async ({ ctx }) => {
  const { id, rid } = ctx.req.cookies;

  try {
    const { userId, user: maybeUser } = await checkTokens(id, rid);
    if (maybeUser) {
      return {
        user: {
          id: maybeUser.id,
        },
      };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    return {
      user: user
        ? {
            id: user.id,
          }
        : null,
    };
  } catch {
    return {
      user: null,
    };
  }
});
