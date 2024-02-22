import { z } from "zod";
import { protectedProcedure } from "../../trpc";
import { doTextToChart } from "../../utils/ai/doTextToChart";
import { assertProjectMember } from "../../utils/assertProjectMember";
import { TRPCError } from "@trpc/server";

export const textToChart = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      text: z.string(),
    })
  )
  .mutation(async ({ input: { projectId, text }, ctx: { userId } }) => {
    await assertProjectMember({ projectId, userId });
    if (process.env.CHATGPT_API_SECRET === "optional") {
      throw new TRPCError({
        message:
          "ChatGPT API secret not set. Please set the CHATGPT_API_SECRET environment variable on the api to use this feature.",
        code: "BAD_REQUEST",
      });
    }

    return {
      info: await doTextToChart(text, projectId),
    };
  });
