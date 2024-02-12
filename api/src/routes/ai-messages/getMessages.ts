import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const getMessages = protectedProcedure
  .input(z.object({}))
  .query(async ({ ctx: { userId } }) => {
    return {
      messages: [],
    };
  });
