import { MsgRole } from "../../app-router-type";
import { LLMInterface } from "./LLMInterface";
import { openai } from "./openai";

export class MistralLLM implements LLMInterface {
  private model = "mistral-medium";

  constructor() {}

  getTokenLimit() {
    return 32_000;
  }

  async chatCompletion({
    messages,
  }: Parameters<LLMInterface["chatCompletion"]>[0]) {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_SECRET}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map((msg) => ({
          role: {
            [MsgRole.user]: "user",
            [MsgRole.ai]: "assistant",
            [MsgRole.system]: "system",
          }[msg.role] as "user" | "assistant" | "system",
          content: msg.text,
        })),
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content || "";
  }
}
