import { z } from "zod";
import { publicProcedure } from "../../trpc";
import { clearAuthCookies } from "../../utils/createAuthTokens";

export const logout = publicProcedure
  .input(z.object({}))
  .mutation(async ({ input, ctx }) => {
    clearAuthCookies(ctx.res);

    return {
      ok: true,
    };
  });
