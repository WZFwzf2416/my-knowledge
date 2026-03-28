import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteCoverField } from "@/components/note-cover-field";
import { requireAppUser } from "@/features/auth/server";
import {
  deleteNoteAction,
  toggleFavoriteAction,
  togglePinnedAction,
  updateNoteAction,
} from "@/features/notes/actions";
import { getNoteDetail, type NoteTagItem } from "@/features/notes/queries";
import { env, hasDatabaseUrl, hasSupabaseEnv } from "@/lib/env";

export default async function NoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ message?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const message = resolvedSearchParams?.message;

  if (!id) {
    notFound();
  }

  let appUserId = "demo-user";

  if (hasSupabaseEnv) {
    const { appUser } = await requireAppUser("请先登录后再查看 Note 详情。");
    appUserId = appUser.id;
  }

  const note = await getNoteDetail(id, appUserId);
  const tagValue = note.noteTags?.map((item: NoteTagItem) => item.tag.name).join(", ") ?? "";
  const shareUrl = `${env.appUrl}/share/${note.id}`;

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-5xl">
        <header className="glass-card rounded-[2rem] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">Note 详情</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
                编辑与管理单条知识卡片
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
                这一页已经把详情、编辑、置顶、收藏、封面图和删除串起来了。修改后会直接写回数据库，删除后会回到仪表盘。
              </p>
            </div>
            <Link
              href="/dashboard"
              className="button-secondary rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface-strong"
            >
              返回仪表盘
            </Link>
          </div>
        </header>

        {message ? (
          <div className="fade-in mt-6 rounded-[2rem] border border-accent/20 bg-accent/10 px-6 py-4 text-sm leading-6 text-foreground">
            {message}
          </div>
        ) : null}

        {!hasDatabaseUrl ? (
          <div className="soft-card mt-6 rounded-[2rem] p-8 text-sm leading-7 text-muted">
            当前数据库未连接，详情页只展示演示数据。连接数据库后，这里会显示真实 Note 内容并支持写回。
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_220px]">
          <form action={updateNoteAction} className="glass-card page-enter stagger-1 rounded-[2rem] p-8">
            <input type="hidden" name="noteId" value={note.id} />
            <label className="block text-sm text-muted">
              标题
              <input
                type="text"
                name="title"
                defaultValue={note.title}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                required
              />
            </label>
            <label className="mt-5 block text-sm text-muted">
              摘要
              <textarea
                name="summary"
                rows={3}
                defaultValue={note.summary ?? ""}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
              />
            </label>

            <div className="mt-5">
              <NoteCoverField initialCoverUrl={note.coverImageUrl ?? ""} canUpload={hasSupabaseEnv} />
            </div>

            <label className="mt-5 block text-sm text-muted">
              正文
              <textarea
                name="content"
                rows={10}
                defaultValue={note.content}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                required
              />
            </label>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="block text-sm text-muted">
                标签
                <input
                  type="text"
                  name="tags"
                  defaultValue={tagValue}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                />
              </label>
              <label className="block text-sm text-muted">
                可见性
                <select
                  name="visibility"
                  defaultValue={note.visibility}
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                >
                  <option value="PRIVATE">私密</option>
                  <option value="PUBLIC">公开</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="button-primary rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-strong"
              >
                保存修改
              </button>
              <Link
                href="/dashboard"
                className="button-secondary rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-surface-strong"
              >
                返回列表
              </Link>
            </div>
          </form>

          <aside className="page-enter stagger-2 space-y-6">
            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-foreground">当前信息</h2>
              <div className="mt-5 space-y-3 text-sm text-muted">
                <p>可见性：{note.visibility === "PUBLIC" ? "公开" : "私密"}</p>
                <p>标签数：{note.noteTags?.length ?? 0}</p>
                <p>收藏状态：{note.isFavorited ? "已收藏" : "未收藏"}</p>
                <p>置顶状态：{note.isPinned ? "已置顶" : "未置顶"}</p>
                <p>封面图：{note.coverImageUrl ? "已设置" : "未设置"}</p>
                <p>最近更新时间：{new Date(note.updatedAt).toLocaleString("zh-CN")}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <form action={togglePinnedAction}>
                  <input type="hidden" name="noteId" value={note.id} />
                  <input type="hidden" name="returnTo" value={`/notes/${note.id}`} />
                  <button
                    type="submit"
                    className="button-secondary w-full rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-surface-strong"
                  >
                    {note.isPinned ? "取消置顶" : "设为置顶"}
                  </button>
                </form>
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="noteId" value={note.id} />
                  <input type="hidden" name="returnTo" value={`/notes/${note.id}`} />
                  <button
                    type="submit"
                    className="button-secondary w-full rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-surface-strong"
                  >
                    {note.isFavorited ? "取消收藏" : "加入收藏"}
                  </button>
                </form>
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-foreground">公开分享</h2>
              {note.visibility === "PUBLIC" ? (
                <div className="mt-4 space-y-3 text-sm text-muted">
                  <p>这条 Note 已公开，你可以通过下面的链接访问分享页。</p>
                  <p className="break-all rounded-2xl border border-border bg-background px-4 py-3 text-xs leading-6 text-foreground">
                    {shareUrl}
                  </p>
                  <Link
                    href={`/share/${note.id}`}
                    className="button-primary inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
                  >
                    打开公开页
                  </Link>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-muted">
                  当前是私密 Note。把可见性切换成“公开”后，这里会生成可分享的公开访问页。
                </p>
              )}
            </div>

            <form action={deleteNoteAction} className="soft-card rounded-[2rem] border border-red-200 p-6">
              <input type="hidden" name="noteId" value={note.id} />
              <h2 className="text-xl font-semibold text-foreground">危险操作</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                删除后会直接从数据库移除这条 Note，目前还没有回收站功能。
              </p>
              <button
                type="submit"
                className="button-danger mt-5 w-full rounded-full bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700"
              >
                删除这条 Note
              </button>
            </form>
          </aside>
        </section>
      </div>
    </main>
  );
}
