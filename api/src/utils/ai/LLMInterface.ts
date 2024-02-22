import { MsgRole } from "../../app-router-type";

export interface LLMInterface {
  getTokenLimit(): number;

  chatCompletion: (opts: {
    user?: string;
    messages: { role: MsgRole; text: string }[];
  }) => Promise<string>;
}
