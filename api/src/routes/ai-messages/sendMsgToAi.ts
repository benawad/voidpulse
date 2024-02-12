import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const sendMsgToAi = protectedProcedure
  .input(
    z.object({
      text: z.string(),
    })
  )
  .mutation(async ({ ctx: { userId } }) => {
    return {
      message: "Hello, World!",
    };
  });
