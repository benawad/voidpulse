import OpenAI from "openai";

export const openai = process.env.CHATGPT_API_SECRET
  ? new OpenAI({
      apiKey: process.env.CHATGPT_API_SECRET,
    })
  : ({} as OpenAI);
