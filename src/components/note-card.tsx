import Link from "next/link";
import { toggleFavoriteAction, togglePinnedAction } from "@/features/notes/actions";
import type { DashboardData } from "@/features/notes/queries";

type NoteCardProps = {
  note: DashboardData["notes"][number];
  isConnected: boolean;
  index: number;
};

export function NoteCard({ note, isConnected, index }: NoteCardProps) {
  const detailHref = isConnected
    ? `/notes/${note.id}`
    : "/dashboard?message=" + encodeURIComponent("请先接入数据库后再查看详情。")

  return (
    <article className={`soft-card interactive-card page-enter overflow-hidden rounded-[2rem] stagger-${(index % 4) + 1}`}>
      {note.coverImageUrl ? (
        <div
          className="border-border bg-surface h-44 w-full border-b"
          style={{
            backgroundImage: `url(${note.coverImageUrl})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          aria-label="Note 封面图"
        />
      ) : null}

      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-foreground text-xl font-semibold">{note.title}</h3>
              {note.isPinned ? (
                <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-xs font-medium">
                  已置顶
                </span>
              ) : null}
              {note.isFavorited ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  已收藏
                </span>
              ) : null}
            </div>
            <p className="text-muted mt-4 text-sm leading-7">
              {note.summary || "这条卡片还没有摘要，后面我们可以继续补正文编辑和摘要生成。"}
            </p>
          </div>
          <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-sm font-medium">
            {note.visibility === "PUBLIC" ? "公开" : "私密"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {note.noteTags?.length ? (
            note.noteTags.map((item) => (
              <span
                key={item.tag.name}
                className="border-border bg-background text-muted rounded-full border px-3 py-1 text-xs font-medium"
              >
                {item.tag.name}
              </span>
            ))
          ) : (
            <span className="border-border bg-background text-muted rounded-full border border-dashed px-3 py-1 text-xs font-medium">
              暂无标签
            </span>
          )}
        </div>

        <div className="text-muted mt-5 flex flex-wrap items-center gap-3 text-xs">
          <span>阅读量：{note.viewCount}</span>
          <span>更新于：{new Date(note.updatedAt).toLocaleDateString("zh-CN")}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isConnected ? (
            <>
              <form action={togglePinnedAction}>
                <input type="hidden" name="noteId" value={note.id} />
                <input type="hidden" name="returnTo" value="/dashboard" />
                <button
                  type="submit"
                  className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-4 py-2 text-sm font-medium"
                >
                  {note.isPinned ? "取消置顶" : "设为置顶"}
                </button>
              </form>
              <form action={toggleFavoriteAction}>
                <input type="hidden" name="noteId" value={note.id} />
                <input type="hidden" name="returnTo" value="/dashboard" />
                <button
                  type="submit"
                  className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-4 py-2 text-sm font-medium"
                >
                  {note.isFavorited ? "取消收藏" : "加入收藏"}
                </button>
              </form>
            </>
          ) : null}

          <Link
            href={detailHref}
            className="button-primary bg-accent hover:bg-accent-strong rounded-full px-4 py-2 text-sm font-medium !text-white"
          >
            查看详情
          </Link>
        </div>
      </div>
    </article>
  );
}
