import type { Metadata } from "next";
import Link from "next/link";
import { env, hasDatabaseUrl, hasOpenAIEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "AI 状态",
  description: "查看当前项目的 AI 提供商、模型配置、降级策略和可用能力。",
};

function detectProviderLabel(baseUrl: string) {
  if (baseUrl.includes("dashscope.aliyuncs.com")) {
    return "千问 / 阿里云百炼兼容接口";
  }

  if (baseUrl.includes("openai.com")) {
    return "OpenAI 兼容接口";
  }

  return "自定义 OpenAI 兼容接口";
}

export default function AiStatusPage() {
  const providerLabel = detectProviderLabel(env.openAiBaseUrl);

  return (
    <main className="bg-background min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-6xl space-y-6">
        <header className="glass-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-accent text-sm font-medium uppercase tracking-[0.3em]">AI 状态</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-foreground text-4xl font-semibold tracking-tight">
                查看当前 AI 提供商与降级策略
              </h1>
              <p className="text-muted mt-4 max-w-3xl text-base leading-8 sm:text-lg">
                这一页专门用来查看 AI 能力是否已配置、当前走的是哪个兼容接口、用了什么模型，以及当远端模型不可用时项目会如何降级。
              </p>
            </div>
            <Link
              href="/dashboard"
              className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-5 py-3 text-sm font-medium"
            >
              返回仪表盘
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="glass-card rounded-[2rem] p-8">
            <h2 className="text-foreground text-2xl font-semibold">当前配置</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="soft-card rounded-[1.5rem] p-5">
                <p className="text-muted text-sm">AI Key 状态</p>
                <p className="text-foreground mt-2 text-lg font-semibold">
                  {hasOpenAIEnv ? "已配置" : "未配置"}
                </p>
              </div>
              <div className="soft-card rounded-[1.5rem] p-5">
                <p className="text-muted text-sm">数据库状态</p>
                <p className="text-foreground mt-2 text-lg font-semibold">
                  {hasDatabaseUrl ? "已连接" : "未连接"}
                </p>
              </div>
              <div className="soft-card rounded-[1.5rem] p-5 sm:col-span-2">
                <p className="text-muted text-sm">当前提供商</p>
                <p className="text-foreground mt-2 text-lg font-semibold">{providerLabel}</p>
                <p className="text-muted mt-2 break-all text-sm">{env.openAiBaseUrl}</p>
              </div>
              <div className="soft-card rounded-[1.5rem] p-5 sm:col-span-2">
                <p className="text-muted text-sm">当前模型</p>
                <p className="text-foreground mt-2 text-lg font-semibold">{env.openAiModel}</p>
              </div>
            </div>
          </div>

          <div className="soft-card rounded-[2rem] p-8">
            <h2 className="text-foreground text-2xl font-semibold">当前能力</h2>
            <div className="text-muted mt-5 space-y-3 text-sm leading-7">
              <p>1. AI 标题：根据标题和正文生成更清晰、便于检索的标题。</p>
              <p>2. AI 摘要：根据已保存正文生成中文摘要。</p>
              <p>3. AI 正文：在不改变原意的前提下润色正文表达和结构。</p>
              <p>4. AI 标签：根据已保存标题和正文提取 3 到 5 个标签。</p>
              <p>5. 本地降级：当远端模型报错、超时或额度不足时，会退回本地规则标题 / 摘要 / 正文 / 标签。</p>
              <p>6. 调试日志：开发环境会打印模型返回结构和 token 使用情况，方便排查兼容接口问题。</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card rounded-[2rem] p-8">
            <h2 className="text-foreground text-2xl font-semibold">降级策略</h2>
            <div className="text-muted mt-5 space-y-3 text-sm leading-7">
              <p>标题降级：优先从正文第一句和已有标题中提炼一个更短、更聚焦的名称。</p>
              <p>摘要降级：优先抽取正文前几句，并把长度收在 80 到 150 字附近。</p>
              <p>正文降级：优先整理段落和句子空白，让正文结构更清晰，但不会编造新事实。</p>
              <p>标签降级：优先从标题、正文和内置技术关键词中提取 3 到 5 个可用标签。</p>
              <p>如果连本地规则都拿不到有效结果，页面会回到普通错误提示，不会静默失败。</p>
            </div>
          </div>

          <div className="glass-card rounded-[2rem] p-8">
            <h2 className="text-foreground text-2xl font-semibold">建议检查项</h2>
            <div className="text-muted mt-5 space-y-3 text-sm leading-7">
              <p>1. 确认 <code>OPENAI_API_KEY</code> 已写入 <code>.env.local</code>。</p>
              <p>2. 如果使用千问，确认 <code>OPENAI_BASE_URL</code> 指向百炼兼容地址。</p>
              <p>3. 如果切换模型后行为异常，可以先打开开发日志查看返回结构。</p>
              <p>4. 如果 AI 可用但结果不理想，可以先调 prompt，再调模型。</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
