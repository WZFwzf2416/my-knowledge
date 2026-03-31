import { createOpenAIClient } from "@/lib/ai/client";
import { debugLog } from "@/lib/debug";
import type { AiTaskResult, SummarizeNoteInput } from "@/lib/ai/types";
import { env, hasOpenAIEnv } from "@/lib/env";
import { buildPolishNotePrompt, NOTE_POLISH_SYSTEM_PROMPT } from "@/features/ai/prompts";

function normalizePolishedContent(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function buildLocalPolishedContent(input: SummarizeNoteInput) {
  const normalized = normalizePolishedContent(input.content);

  if (!normalized) {
    return "";
  }

  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((paragraph) => {
      if (paragraph.length <= 80) {
        return paragraph;
      }

      const sentences = paragraph
        .split(/(?<=[。！？!?；;])/)
        .map((item) => item.trim())
        .filter(Boolean);

      return sentences.join(" ");
    });

  return paragraphs.join("\n\n");
}

export async function polishNoteContent(
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
        content: NOTE_POLISH_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildPolishNotePrompt(input),
      },
    ],
    temperature: 0.35,
  });

  debugLog("ai polish response", response);
  debugLog("ai polish first choice", response.choices?.[0]);
  debugLog("ai polish usage", response.usage);

  const polishedContent = normalizePolishedContent(response.choices[0]?.message?.content?.trim() ?? "");

  if (!polishedContent) {
    throw new Error("未生成有效正文。");
  }

  return {
    data: polishedContent,
    model: env.openAiModel,
  };
}
