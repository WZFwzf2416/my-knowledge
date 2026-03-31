import { createOpenAIClient } from "@/lib/ai/client";
import { debugLog } from "@/lib/debug";
import type { AiTaskResult, SummarizeNoteInput } from "@/lib/ai/types";
import { env, hasOpenAIEnv } from "@/lib/env";
import { buildSummarizeNotePrompt, NOTE_SUMMARY_SYSTEM_PROMPT } from "@/features/ai/prompts";

function normalizeContent(content: string) {
  return content.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

export function buildLocalSummary(input: SummarizeNoteInput) {
  const normalizedContent = normalizeContent(input.content);

  if (!normalizedContent) {
    return "";
  }

  const sentences = normalizedContent
    .split(/(?<=[。！？!?；;])/)
    .map((item) => item.trim())
    .filter(Boolean);

  let summary = "";

  for (const sentence of sentences) {
    const nextSummary = `${summary}${sentence}`.trim();

    if (nextSummary.length > 150 && summary.length >= 80) {
      break;
    }

    if (nextSummary.length > 170 && summary.length > 0) {
      break;
    }

    summary = nextSummary;

    if (summary.length >= 110) {
      break;
    }
  }

  if (!summary) {
    summary = normalizedContent.slice(0, 140).trim();
  }

  if (summary.length > 150) {
    summary = `${summary.slice(0, 147).trim()}...`;
  }

  if (summary.length < 40) {
    const title = input.title.trim();
    const prefix = title ? `${title}：` : "";
    summary = `${prefix}${normalizedContent.slice(0, Math.max(60, 120 - prefix.length)).trim()}`;
  }

  return summary;
}

export async function summarizeNoteContent(
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
        content: NOTE_SUMMARY_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildSummarizeNotePrompt(input),
      },
    ],
    temperature: 0.4,
  });

  debugLog("ai summarize response", response);
  debugLog("ai summarize first choice", response.choices?.[0]);
  debugLog("ai summarize usage", response.usage);

  const summary = response.choices[0]?.message?.content?.trim() ?? "";

  if (!summary) {
    throw new Error("未生成有效摘要。");
  }

  return {
    data: summary,
    model: env.openAiModel,
  };
}
