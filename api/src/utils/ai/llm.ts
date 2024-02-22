import { MistralLLM } from "./MistralLLM";
import { OpenLLM } from "./OpenLLM";

export const llm = process.env.MISTRAL_API_SECRET
  ? new MistralLLM()
  : new OpenLLM();
