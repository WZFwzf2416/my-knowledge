import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardFilterPanel } from "@/components/dashboard-filter-panel";
import { NoteCard } from "@/components/note-card";
import { NoteCoverField } from "@/components/note-cover-field";
import { PaginationControls } from "@/components/pagination-controls";
import { logoutAction } from "@/features/auth/actions";
import { getOptionalAuthUser } from "@/features/auth/server";
import { createNoteAction } from "@/features/notes/actions";
import { getDashboardData } from "@/features/notes/queries";
import { hasSupabaseEnv } from "@/lib/env";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string; query?: string; tag?: string; page?: string; sort?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const message = params?.message;
  const query = params?.query?.trim() ?? "";
  const selectedTag = params?.tag?.trim() ?? "";
  const page = Number(params?.page ?? "1");
  const sort = params?.sort?.trim() === "oldest" ? "oldest" : "latest";
  const authUser = await getOptionalAuthUser();

  if (hasSupabaseEnv && !authUser) {
    redirect("/login?message=" + encodeURIComponent("请先登录后再访问仪表盘。"));
  }

  const { notes, isConnected, nickname, tags, totalCount, totalPages } = await getDashboardData(authUser, {
    query,
    tag: selectedTag,
    page,
    sort,
  });

  const stats: Array<{ label: string; value: string }> = [
    { label: "当前卡片", value: String(totalCount) },
    { label: "当前标签", value: String(tags.length) },
    { label: "当前筛选", value: selectedTag || (query ? "关键词" : "全部") },
  ];

  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/90 shadow-[0_24px_80px_rgba(31,41,55,0.08)] backdrop-blur-xl">
          <div className="border-b border-border/70 bg-[linear-gradient(135deg,_rgba(20,83,45,0.12),_rgba(255,255,255,0.7))] p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">仪表盘</p>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                  欢迎回来，{nickname}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
                  这里已经进入产品化阶段。你可以新建、搜索、筛选、编辑和删除知识卡片，也可以开始为真实部署做最后准备。
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
                <div className="soft-card rounded-3xl px-5 py-4 backdrop-blur-sm">
                  <p className="text-sm font-medium text-muted">连接状态</p>
                  <p className="mt-2 text-sm text-foreground">
                    {isConnected
                      ? "已接入数据库，可读取真实 Note 列表"
                      : "当前展示演示数据，等待数据库连接"}
                  </p>
                </div>
                {hasSupabaseEnv ? (
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="button-secondary rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:bg-surface-strong"
                    >
                      退出登录
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            {stats.map((item, index) => (
              <div key={item.label} className={`soft-card page-enter rounded-3xl px-5 py-5 stagger-${index + 1}`}>
                <p className="text-sm text-muted">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </header>

        {message ? (
          <div className="fade-in mt-6 rounded-[2rem] border border-accent/20 bg-accent/10 px-6 py-4 text-sm leading-6 text-foreground">
            {message}
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6 page-enter stagger-1">
            <div className="glass-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-foreground">新建知识卡片</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                这是第一条真实业务链路。你在这里提交后，数据会直接写入 Supabase PostgreSQL，然后在右侧列表里显示出来。
              </p>

              <form action={createNoteAction} className="mt-6 space-y-4">
                <label className="block text-sm text-muted">
                  标题
                  <input
                    type="text"
                    name="title"
                    placeholder="例如：全栈学习路线"
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                    required
                  />
                </label>
                <label className="block text-sm text-muted">
                  摘要
                  <textarea
                    name="summary"
                    rows={3}
                    placeholder="一句话描述这条知识卡片的重点"
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                  />
                </label>

                <NoteCoverField initialCoverUrl="" canUpload={hasSupabaseEnv} />

                <label className="block text-sm text-muted">
                  正文
                  <textarea
                    name="content"
                    rows={6}
                    placeholder="输入正文内容，后面我们还可以继续升级成富文本编辑。"
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                    required
                  />
                </label>
                <label className="block text-sm text-muted">
                  标签
                  <input
                    type="text"
                    name="tags"
                    placeholder="例如：学习路线, Next.js, Prisma"
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                  />
                </label>
                <label className="block text-sm text-muted">
                  可见性
                  <select
                    name="visibility"
                    defaultValue="PRIVATE"
                    className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                  >
                    <option value="PRIVATE">私密</option>
                    <option value="PUBLIC">公开</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="button-primary w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
                >
                  创建 Note
                </button>
              </form>
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-foreground">部署准备</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>1. 确认 Vercel 环境变量和本地 `.env.local` 保持一致。</p>
                <p>2. 确认 Supabase Auth 的回调域名已包含线上地址。</p>
                <p>3. 上线前先跑一次 `npm run build`。</p>
              </div>
              <Link
                href="/docs/product-requirements"
                className="button-secondary mt-5 inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface-strong"
              >
                查看需求文档
              </Link>
            </div>
          </aside>

          <section className="page-enter stagger-2">
            <DashboardFilterPanel query={query} selectedTag={selectedTag} tags={tags} sort={sort} />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-border bg-surface/80 px-5 py-4 text-sm text-muted">
              <p>共 {totalCount} 条内容，本页显示 {notes.length} 条。</p>
              <div className="flex items-center gap-2">
                <span>排序：</span>
                <Link
                  href={`/dashboard?${new URLSearchParams({ ...(query ? { query } : {}), ...(selectedTag ? { tag: selectedTag } : {}), sort: "latest" }).toString()}`}
                  className={sort === "latest" ? "font-medium text-accent" : "hover:text-foreground"}
                >
                  最新优先
                </Link>
                <span>/</span>
                <Link
                  href={`/dashboard?${new URLSearchParams({ ...(query ? { query } : {}), ...(selectedTag ? { tag: selectedTag } : {}), sort: "oldest" }).toString()}`}
                  className={sort === "oldest" ? "font-medium text-accent" : "hover:text-foreground"}
                >
                  最早优先
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {notes.length > 0 ? (
                notes.map((note, index) => (
                  <NoteCard key={note.id} note={note} isConnected={isConnected} index={index} />
                ))
              ) : (
                <div className="soft-card page-enter rounded-[2rem] p-8 text-center">
                  <h3 className="text-2xl font-semibold text-foreground">没有匹配的知识卡片</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    你可以换一个关键词、切换标签，或者先新建一条新的 Note。
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <PaginationControls
                basePath="/dashboard"
                page={page}
                totalPages={totalPages}
                params={{ query, tag: selectedTag, sort }}
              />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
