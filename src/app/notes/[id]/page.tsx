import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteAiRevisionKind } from "@prisma/client";
import { AiAssistPanel } from "@/components/ai-assist-panel";
import { NoteCoverField } from "@/components/note-cover-field";
import { requireAppUser } from "@/features/auth/server";
import {
  deleteNoteAction,
  toggleFavoriteAction,
  togglePinnedAction,
  updateNoteAction,
} from "@/features/notes/actions";
import {
  generatePolishAction,
  generateSummaryAction,
  generateTagsAction,
  generateTitleAction,
  undoLatestAiAction,
} from "@/features/notes/ai-actions";
import { getNoteDetail, type NoteTagItem } from "@/features/notes/queries";
import { env, hasDatabaseUrl, hasOpenAIEnv, hasSupabaseEnv } from "@/lib/env";

function isAiSummaryMessage(message?: string) {
  return Boolean(message && message.includes("摘要"));
}

function isAiTagsMessage(message?: string) {
  return Boolean(message && message.includes("标签"));
}

function isAiTitleMessage(message?: string) {
  return Boolean(message && message.includes("标题"));
}

function isAiPolishMessage(message?: string) {
  return Boolean(message && (message.includes("正文") || message.includes("润色")));
}

function canUndoRevision(kinds: string[], target: NoteAiRevisionKind) {
  return kinds.includes(target);
}

function formatAiRevisionKind(kind: NoteAiRevisionKind) {
  switch (kind) {
    case "TITLE":
      return "标题";
    case "SUMMARY":
      return "摘要";
    case "CONTENT":
      return "正文";
    case "TAGS":
      return "标签";
    default:
      return kind;
  }
}

function UndoAiButton({
  action,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  label: string;
}) {
  return (
    <button
      type="submit"
      formAction={action}
      formNoValidate
      className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-4 py-2 text-xs font-medium whitespace-nowrap"
    >
      {label}
    </button>
  );
}

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
  const summaryUpdated = isAiSummaryMessage(message);
  const tagsUpdated = isAiTagsMessage(message);
  const titleUpdated = isAiTitleMessage(message);
  const polishUpdated = isAiPolishMessage(message);
  const canUndoTitle = canUndoRevision(note.aiRevisionKinds, "TITLE");
  const canUndoSummary = canUndoRevision(note.aiRevisionKinds, "SUMMARY");
  const canUndoContent = canUndoRevision(note.aiRevisionKinds, "CONTENT");
  const canUndoTags = canUndoRevision(note.aiRevisionKinds, "TAGS");
  const undoTitleAction = undoLatestAiAction.bind(null, note.id, "TITLE");
  const undoSummaryAction = undoLatestAiAction.bind(null, note.id, "SUMMARY");
  const undoContentAction = undoLatestAiAction.bind(null, note.id, "CONTENT");
  const undoTagsAction = undoLatestAiAction.bind(null, note.id, "TAGS");

  return (
    <main className="bg-background min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-5xl">
        <header className="glass-card rounded-[2rem] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-accent text-sm font-medium uppercase tracking-[0.3em]">Note 详情</p>
              <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight">
                编辑与管理单条知识卡片
              </h1>
              <p className="text-muted mt-4 max-w-3xl text-base leading-8 sm:text-lg">
                这一页把详情、编辑、置顶、收藏、封面图、删除和 AI 能力串成了一条完整链路。你现在可以在这里生成标题、摘要、标签、润色正文，并按类型撤销最近一次 AI 修改。
              </p>
            </div>
            <Link
              href="/dashboard"
              className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-4 py-2 text-sm font-medium"
            >
              返回仪表盘
            </Link>
          </div>
        </header>

        {message ? (
          <div className="fade-in border-accent/20 bg-accent/10 text-foreground mt-6 rounded-[2rem] border px-6 py-4 text-sm leading-6">
            {message}
          </div>
        ) : null}

        {!hasDatabaseUrl ? (
          <div className="soft-card text-muted mt-6 rounded-[2rem] p-8 text-sm leading-7">
            当前数据库未连接，这里显示的是演示内容。连接数据库后，这个页面会显示真实 Note，并支持写回保存。
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_260px]">
          <form action={updateNoteAction} className="glass-card page-enter stagger-1 rounded-[2rem] p-8">
            <input type="hidden" name="noteId" value={note.id} />

            <label className="text-muted block text-sm">
              标题
              <input
                type="text"
                name="title"
                defaultValue={note.title}
                className="border-border bg-background text-foreground focus:border-accent mt-2 w-full rounded-2xl border px-4 py-3 transition-colors outline-none"
                required
              />
            </label>

            <AiAssistPanel
              title="AI 标题"
              description="基于当前已保存的标题和正文生成一个更清晰、便于检索的标题。AI 服务失败时，也会自动退回本地规则标题。"
              canUseAi={hasOpenAIEnv}
              formAction={generateTitleAction}
              idleLabel="AI 优化标题"
              pendingLabel="正在优化标题..."
              icon="title"
              tone="violet"
              actionSlot={canUndoTitle ? <UndoAiButton action={undoTitleAction} label="撤销标题" /> : null}
              successHint={
                titleUpdated ? (
                  <div className="rounded-2xl border border-violet-200 bg-violet-50/80 px-4 py-3 text-sm leading-6 text-violet-800">
                    标题刚刚更新完成了。建议你快速确认一下是否足够具体、便于检索，也符合你自己的命名习惯。
                  </div>
                ) : null
              }
            />

            <label className="text-muted mt-5 block text-sm">
              摘要
              <textarea
                name="summary"
                rows={3}
                defaultValue={note.summary ?? ""}
                className="border-border bg-background text-foreground focus:border-accent mt-2 w-full rounded-2xl border px-4 py-3 transition-colors outline-none"
              />
            </label>

            <AiAssistPanel
              title="AI 摘要"
              description="基于当前已保存的正文生成 80 到 150 字的中文摘要。AI 服务不可用时，会自动退回本地规则摘要，避免这条链路完全中断。"
              canUseAi={hasOpenAIEnv}
              formAction={generateSummaryAction}
              idleLabel="AI 生成摘要"
              pendingLabel="正在生成摘要..."
              icon="summary"
              tone="emerald"
              actionSlot={canUndoSummary ? <UndoAiButton action={undoSummaryAction} label="撤销摘要" /> : null}
              successHint={
                summaryUpdated ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-emerald-800">
                    摘要刚刚更新完成了。建议你顺手通读一遍，确认语气、长度和信息密度都符合这条知识卡片的用途。
                  </div>
                ) : null
              }
            />

            <div className="mt-5">
              <NoteCoverField initialCoverUrl={note.coverImageUrl ?? ""} canUpload={hasSupabaseEnv} />
            </div>

            <label className="text-muted mt-5 block text-sm">
              正文
              <textarea
                name="content"
                rows={10}
                defaultValue={note.content}
                className="border-border bg-background text-foreground focus:border-accent mt-2 w-full rounded-2xl border px-4 py-3 transition-colors outline-none"
                required
              />
            </label>

            <AiAssistPanel
              title="AI 正文"
              description="基于当前已保存的正文进行润色，尽量保留原意和技术信息，只优化表达和结构。AI 服务失败时，会自动退回本地规则润色。"
              canUseAi={hasOpenAIEnv}
              formAction={generatePolishAction}
              idleLabel="AI 润色正文"
              pendingLabel="正在润色正文..."
              icon="summary"
              tone="emerald"
              actionSlot={canUndoContent ? <UndoAiButton action={undoContentAction} label="撤销正文" /> : null}
              successHint={
                polishUpdated ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-6 text-amber-800">
                    正文刚刚更新完成了。建议你重点看一眼技术事实、代码标识和语气是否仍然符合你的原始表达。
                  </div>
                ) : null
              }
            />

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(220px,0.55fr)]">
              <div>
                <label className="text-muted block text-sm">
                  标签
                  <input
                    type="text"
                    name="tags"
                    defaultValue={tagValue}
                    className="border-border bg-background text-foreground focus:border-accent mt-2 w-full rounded-2xl border px-4 py-3 transition-colors outline-none"
                  />
                </label>

                <AiAssistPanel
                  title="AI 标签"
                  description="基于当前已保存的标题和正文提取 3 到 5 个标签。AI 服务失败时，也会自动退回本地规则提取。"
                  canUseAi={hasOpenAIEnv}
                  formAction={generateTagsAction}
                  idleLabel="AI 生成标签"
                  pendingLabel="正在生成标签..."
                  icon="tags"
                  tone="sky"
                  actionSlot={canUndoTags ? <UndoAiButton action={undoTagsAction} label="撤销标签" /> : null}
                  successHint={
                    tagsUpdated ? (
                      <div className="rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm leading-6 text-sky-800">
                        标签刚刚更新完成了。你可以把 AI 生成的结果当作初稿，再按自己的知识体系做少量收口。
                      </div>
                    ) : null
                  }
                />
              </div>

              <label className="text-muted block text-sm">
                可见性
                <select
                  name="visibility"
                  defaultValue={note.visibility}
                  className="border-border bg-background text-foreground focus:border-accent mt-2 w-full rounded-2xl border px-4 py-3 transition-colors outline-none"
                >
                  <option value="PRIVATE">私密</option>
                  <option value="PUBLIC">公开</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="button-primary bg-accent hover:bg-accent-strong rounded-full px-6 py-3 text-sm font-medium !text-white"
              >
                保存修改
              </button>
              <Link
                href="/dashboard"
                className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-6 py-3 text-sm font-medium"
              >
                返回列表
              </Link>
            </div>
          </form>

          <aside className="page-enter stagger-2 space-y-6">
            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-foreground text-xl font-semibold">当前信息</h2>
              <div className="text-muted mt-5 space-y-3 text-sm">
                <p>可见性：{note.visibility === "PUBLIC" ? "公开" : "私密"}</p>
                <p>标签数：{note.noteTags?.length ?? 0}</p>
                <p>收藏状态：{note.isFavorited ? "已收藏" : "未收藏"}</p>
                <p>置顶状态：{note.isPinned ? "已置顶" : "未置顶"}</p>
                <p>封面图：{note.coverImageUrl ? "已设置" : "未设置"}</p>
                <p>摘要状态：{note.summary?.trim() ? "已有摘要" : "暂无摘要"}</p>
                <p>
                  AI 可撤销项：
                  {note.aiRevisionKinds.length > 0
                    ? note.aiRevisionKinds.map((kind) => formatAiRevisionKind(kind)).join(" / ")
                    : "暂无"}
                </p>
                <p>阅读量：{note.viewCount}</p>
                <p>最近更新时间：{new Date(note.updatedAt).toLocaleString("zh-CN")}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <form action={togglePinnedAction}>
                  <input type="hidden" name="noteId" value={note.id} />
                  <input type="hidden" name="returnTo" value={`/notes/${note.id}`} />
                  <button
                    type="submit"
                    className="button-secondary border-border bg-background hover:bg-surface-strong w-full rounded-full border px-5 py-3 text-sm font-medium"
                  >
                    {note.isPinned ? "取消置顶" : "设为置顶"}
                  </button>
                </form>
                <form action={toggleFavoriteAction}>
                  <input type="hidden" name="noteId" value={note.id} />
                  <input type="hidden" name="returnTo" value={`/notes/${note.id}`} />
                  <button
                    type="submit"
                    className="button-secondary border-border bg-background hover:bg-surface-strong w-full rounded-full border px-5 py-3 text-sm font-medium"
                  >
                    {note.isFavorited ? "取消收藏" : "加入收藏"}
                  </button>
                </form>
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-foreground text-xl font-semibold">公开分享</h2>
              {note.visibility === "PUBLIC" ? (
                <div className="text-muted mt-4 space-y-3 text-sm">
                  <p>这条 Note 已公开，你可以通过下面的链接访问分享页。</p>
                  <p className="border-border bg-background text-foreground rounded-2xl border px-4 py-3 text-xs leading-6 break-all">
                    {shareUrl}
                  </p>
                  <Link
                    href={`/share/${note.id}`}
                    className="button-primary bg-accent hover:bg-accent-strong inline-flex rounded-full px-5 py-3 text-sm font-medium !text-white"
                  >
                    打开公开页
                  </Link>
                </div>
              ) : (
                <p className="text-muted mt-4 text-sm leading-6">
                  当前还是私密 Note。把可见性改成“公开”后，这里会自动出现可分享的访问页。
                </p>
              )}
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-foreground text-xl font-semibold">AI 配置提示</h2>
              <p className="text-muted mt-3 text-sm leading-6">
                当前模型：<code>{env.openAiModel}</code>
              </p>
              <p className="text-muted mt-3 text-sm leading-6">
                {hasOpenAIEnv
                  ? "已检测到 AI API Key，可以直接试 AI 标题、AI 摘要、AI 正文和 AI 标签。每类结果都支持撤销最近一次 AI 修改。"
                  : "还没有检测到 AI API Key。先在 .env.local 里补上，再回来试 AI 功能。"}
              </p>
              <Link href="/ai" className="text-accent hover:text-accent-strong mt-4 inline-flex text-sm font-medium">
                查看 AI 状态说明页
              </Link>
            </div>

            <form action={deleteNoteAction} className="soft-card rounded-[2rem] border border-red-200 p-6">
              <input type="hidden" name="noteId" value={note.id} />
              <h2 className="text-foreground text-xl font-semibold">危险操作</h2>
              <p className="text-muted mt-3 text-sm leading-6">
                删除后会直接从数据库移除这条 Note，目前还没有回收站功能。
              </p>
              <button
                type="submit"
                className="button-danger mt-5 w-full rounded-full bg-red-600 px-5 py-3 text-sm font-medium !text-white hover:bg-red-700"
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
