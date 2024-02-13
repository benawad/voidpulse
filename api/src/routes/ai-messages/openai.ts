import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_SECRET,
});
