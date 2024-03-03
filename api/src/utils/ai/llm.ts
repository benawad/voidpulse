import { MistralLLM } from "./MistralLLM";
import { OpenLLM } from "./OpenLLM";

export const llm = process.env.CHATGPT_API_SECRET
  ? new OpenLLM()
  : new MistralLLM();
