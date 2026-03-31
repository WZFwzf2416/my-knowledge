import OpenAI from "openai";
import { env, hasOpenAIEnv } from "@/lib/env";

let openAIClient: OpenAI | null = null;

export function createOpenAIClient() {
  if (!hasOpenAIEnv) {
    throw new Error("AI API Key 尚未配置，请先填写 OPENAI_API_KEY。");
  }

  openAIClient ??= new OpenAI({
    apiKey: env.openAiApiKey,
    baseURL: env.openAiBaseUrl,
  });

  return openAIClient;
}
