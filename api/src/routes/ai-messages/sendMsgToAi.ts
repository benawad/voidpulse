import OpenAI from "openai";
import { z } from "zod";
import { MsgRole } from "../../app-router-type";
import { protectedProcedure } from "../../trpc";

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_SECRET,
});

export const sendMsgToAi = protectedProcedure
  .input(
    z.object({
      prevMsgs: z.array(
        z.object({
          role: z.nativeEnum(MsgRole),
          text: z.string(),
        })
      ),
      text: z.string(),
    })
  )
  .mutation(async ({ input: { prevMsgs, text }, ctx: { userId } }) => {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        ...prevMsgs.map((msg) => ({
          role: (msg.role === MsgRole.user ? "user" : "assistant") as
            | "user"
            | "assistant",
          content: msg.text,
        })),
        { role: "user", content: text },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(chatCompletion);
    console.log(JSON.stringify(chatCompletion));

    return {
      message: chatCompletion.choices[0].message.content,
    };
  });
