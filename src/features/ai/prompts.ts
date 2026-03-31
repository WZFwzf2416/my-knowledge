import type { SummarizeNoteInput } from "@/lib/ai/types";

export const NOTE_SUMMARY_SYSTEM_PROMPT = `你是一个帮助用户整理技术知识卡片的中文写作助手。
你的任务是根据用户提供的标题和正文，生成一段简洁、准确、可直接用于知识库卡片的摘要。
不要编造原文中没有的信息，不要使用营销语气，不要输出标题或项目符号。`;

export const NOTE_TAGS_SYSTEM_PROMPT = `你是一个帮助用户整理知识卡片标签的中文助手。
请根据标题和正文提取 3 到 5 个简洁标签。
标签应突出主题、技术栈或任务类型。
只返回标签内容本身，使用中文逗号分隔，不要输出解释。`;

export const NOTE_TITLE_SYSTEM_PROMPT = `你是一个帮助用户优化知识卡片标题的中文助手。
请根据已有标题和正文，生成一个更清晰、具体、适合知识库检索的标题。
标题要简洁，不要使用夸张语气，不要添加引号，不要输出解释。`;

export const NOTE_POLISH_SYSTEM_PROMPT = `你是一个帮助用户润色技术知识卡片正文的中文助手。
请在不改变原意、不编造新事实的前提下，让正文更清晰、更顺滑、更适合个人知识库长期保存。
保留技术术语、代码标识和关键信息，不要额外添加不存在的结论。`;

export function buildSummarizeNotePrompt(input: SummarizeNoteInput) {
  return `请为下面这条知识卡片生成 80 到 150 字的中文摘要。\n\n标题：${input.title || "未命名笔记"}\n\n正文：\n${input.content}`;
}

export function buildTagSuggestPrompt(input: SummarizeNoteInput) {
  return `请为下面这条知识卡片提取 3 到 5 个标签。\n\n标题：${input.title || "未命名笔记"}\n\n正文：\n${input.content}`;
}

export function buildTitleSuggestPrompt(input: SummarizeNoteInput) {
  return `请为下面这条知识卡片生成一个更清晰、便于检索的中文标题。\n\n当前标题：${input.title || "未命名笔记"}\n\n正文：\n${input.content}`;
}

export function buildPolishNotePrompt(input: SummarizeNoteInput) {
  return `请润色下面这条知识卡片的正文。要求：\n1. 保留原意和技术信息。\n2. 优化语句通顺度和结构。\n3. 不新增原文没有的事实。\n4. 直接输出润色后的正文。\n\n标题：${input.title || "未命名笔记"}\n\n正文：\n${input.content}`;
}
