import { MsgRole } from "../../app-router-type";
import { LLMInterface } from "./LLMInterface";
import { openai } from "./openai";

export class OpenLLM implements LLMInterface {
  private model = "gpt-3.5-turbo";

  constructor() {}

  getTokenLimit() {
    return 4096;
  }

  async chatCompletion({
    user,
    messages,
  }: Parameters<LLMInterface["chatCompletion"]>[0]) {
    const resp = await openai.chat.completions.create({
      user,
      messages: messages.map((msg) => {
        return {
          role: {
            [MsgRole.user]: "user",
            [MsgRole.ai]: "assistant",
            [MsgRole.system]: "system",
          }[msg.role] as "user" | "assistant" | "system",
          content: msg.text,
        };
      }),
      model: this.model,
    });

    return resp.choices[0].message.content || "";
  }
}
