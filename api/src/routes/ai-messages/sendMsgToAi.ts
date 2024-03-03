import { z } from "zod";
import { MsgRole } from "../../app-router-type";
import { protectedProcedure } from "../../trpc";
import { openai } from "../../utils/ai/openai";
import { llm } from "../../utils/ai/llm";

function approxNumTokensFromString(message: string) {
  // doing 3 instead of 4 to be safe
  return Math.ceil(message.length / 3);
}

// https://twitter.com/dgant/status/1761039161937588253
const systemDefault = `I am a human expert in all subjects. I am highly competent and only need your assistance filling in small gaps in my knowledge. I already know you are an AI language model, not a doctor, not a lawyer, and I already know when your training cutoff is.

Respond briefly. Be terse. Answer questions literally. Skip disclaimers.`;

export const sendMsgToAi = protectedProcedure
  .input(
    z.object({
      data: z.string(),
      prevMsgs: z.array(
        z.object({
          role: z.nativeEnum(MsgRole),
          text: z.string(),
        })
      ),
      text: z.string(),
    })
  )
  .mutation(async ({ input: { prevMsgs, text, data }, ctx: { userId } }) => {
    if (process.env.CHATGPT_API_SECRET === "optional") {
      return {
        message:
          "ChatGPT API secret not set. Please set the CHATGPT_API_SECRET environment variable on the api to use this feature.",
      };
    }

    const systemMsg = data.length
      ? `${systemDefault} I am a data analyst assistant. Try to provide an insight. Here is the data in question: ${data}`
      : `${systemDefault} I am a data analyst assistant who is waiting for the user to create a report so you can analyze the data with them.`;

    const tokenLimit = llm.getTokenLimit();
    const dataTokenLength = approxNumTokensFromString(systemMsg);
    const textTokenLength = approxNumTokensFromString(text);
    let currTokensLength = dataTokenLength + textTokenLength;
    if (currTokensLength > tokenLimit) {
      return {
        message: `Chart has too much data that it doesn't fit into the AI context limit. Do less breakdowns, shrink the date range, or use less data.`,
      };
    }

    const allowedPrevMsgs: typeof prevMsgs = [];
    for (let i = prevMsgs.length - 1; i >= 0; i--) {
      const tokenLength = approxNumTokensFromString(prevMsgs[i].text);
      if (currTokensLength + tokenLength > tokenLimit) {
        break;
      }
      currTokensLength += tokenLength;
      allowedPrevMsgs.push(prevMsgs[i]);
    }
    allowedPrevMsgs.reverse();

    const message = await llm.chatCompletion({
      user: userId,
      messages: [
        {
          role: MsgRole.system,
          text: systemMsg,
        },
        ...allowedPrevMsgs,
        { role: MsgRole.user, text: text },
      ],
    });

    return {
      message,
    };
  });
