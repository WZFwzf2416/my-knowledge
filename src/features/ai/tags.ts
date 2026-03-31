import { createOpenAIClient } from "@/lib/ai/client";
import { debugLog } from "@/lib/debug";
import type { AiTaskResult, SummarizeNoteInput } from "@/lib/ai/types";
import { env, hasOpenAIEnv } from "@/lib/env";
import { buildTagSuggestPrompt, NOTE_TAGS_SYSTEM_PROMPT } from "@/features/ai/prompts";

const BUILT_IN_KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Prisma",
  "Supabase",
  "PostgreSQL",
  "Node.js",
  "Tailwind",
  "Auth",
  "API",
  "AI",
  "Qwen",
  "OpenAI",
  "Vercel",
  "Docker",
  "Playwright",
  "测试",
  "部署",
  "鉴权",
  "数据库",
  "前端",
  "全栈",
  "笔记",
  "知识库",
];

const TAG_STOP_WORDS = new Set([
  "这是",
  "这个",
  "一个",
  "我们",
  "你们",
  "他们",
  "已经",
  "可以",
  "需要",
  "通过",
  "进行",
  "实现",
  "使用",
  "以及",
  "如果",
  "当前",
  "相关",
  "内容",
  "功能",
  "页面",
  "项目",
  "笔记",
  "知识",
  "卡片",
]);

function normalizeTag(tag: string) {
  return tag
    .replace(/[、,，|/]+/g, " ")
    .replace(/^[#\-\s]+|[#\-\s]+$/g, "")
    .trim();
}

function sanitizeTags(tags: string[]) {
  return [...new Set(tags.map(normalizeTag).filter((tag) => tag.length >= 2 && tag.length <= 20 && !TAG_STOP_WORDS.has(tag)))].slice(0, 5);
}

export function buildLocalTags(input: SummarizeNoteInput) {
  const content = `${input.title} ${input.content}`;
  const collected: string[] = [];

  for (const keyword of BUILT_IN_KEYWORDS) {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      collected.push(keyword);
    }
  }

  const chineseMatches = input.title.match(/[\u4e00-\u9fa5]{2,6}/g) ?? [];
  const englishMatches = content.match(/[A-Za-z][A-Za-z0-9.+#-]{1,20}/g) ?? [];

  collected.push(...chineseMatches, ...englishMatches);

  return sanitizeTags(collected);
}

export async function suggestTagsForNote(
  input: SummarizeNoteInput,
): Promise<AiTaskResult<string[]>> {
  if (!hasOpenAIEnv) {
    throw new Error("AI 功能尚未配置，请先填写 OPENAI_API_KEY。");
  }

  const client = createOpenAIClient();
  const response = await client.chat.completions.create({
    model: env.openAiModel,
    messages: [
      {
        role: "system",
        content: NOTE_TAGS_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: buildTagSuggestPrompt(input),
      },
    ],
    temperature: 0.3,
  });

  debugLog("ai tags response", response);
  debugLog("ai tags first choice", response.choices?.[0]);
  debugLog("ai tags usage", response.usage);

  const rawContent = response.choices[0]?.message?.content?.trim() ?? "";
  const tags = sanitizeTags(rawContent.split(/[，,\n、]+/g));

  if (tags.length === 0) {
    throw new Error("未生成有效标签。");
  }

  return {
    data: tags,
    model: env.openAiModel,
  };
}
