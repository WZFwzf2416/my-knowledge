import { createOpenAIClient } from "@/lib/ai/client";
import { debugLog } from "@/lib/debug";
import type { AiTaskResult, SummarizeNoteInput } from "@/lib/ai/types";
import { env, hasOpenAIEnv } from "@/lib/env";
import { buildTitleSuggestPrompt, NOTE_TITLE_SYSTEM_PROMPT } from "@/features/ai/prompts";

function sanitizeTitle(title: string) {
  return title.replace(/[\r\n]+/g, " ").replace(/["'“”‘’]/g, "").trim();
}

export function buildLocalTitle(input: SummarizeNoteInput) {
  const normalizedTitle = sanitizeTitle(input.title);
  const normalizedContent = input.content.replace(/\s+/g, " ").trim();

  if (normalizedTitle.length >= 6 && normalizedTitle.length <= 28) {
    return normalizedTitle;
  }

  const firstSentence = normalizedContent.split(/(?<=[。！？!?；;])/)[0]?.trim() ?? "";

  if (firstSentence) {
    const baseTitle = sanitizeTitle(firstSentence.replace(/[。！？!?；;]+$/g, ""));

    if (baseTitle.length >= 6) {
      return baseTitle.slice(0, 28).trim();
    }
  }

  if (normalizedTitle) {
    return normalizedTitle.slice(0, 28).trim();
  }

  return normalizedContent.slice(0, 24).trim() || "未命名笔记";
}

export async function suggestTitleForNote(
  input: SummarizeNoteInput,
): Promise<AiTaskResult<string>> {
  if (!hasOpenAIEnv) {
    throw new Error("AI 功能尚未配置，请先填写 OPENAI_API_KEY。");
  }

  const client = createOpenAIClient();
  const response = await client.chat.completions.create({
    model: env.openAiModel,
    messages: [
      {
        role: "system",
        content: NOTE_TITLE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildTitleSuggestPrompt(input),
      },
    ],
    temperature: 0.3,
  });

  debugLog("ai title response", response);
  debugLog("ai title first choice", response.choices?.[0]);
  debugLog("ai title usage", response.usage);

  const title = sanitizeTitle(response.choices[0]?.message?.content?.trim() ?? "");

  if (!title) {
    throw new Error("未生成有效标题。");
  }

  return {
    data: title.slice(0, 40),
    model: env.openAiModel,
  };
}
