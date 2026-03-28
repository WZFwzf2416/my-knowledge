import Link from "next/link";
import { PaginationControls } from "@/components/pagination-controls";
import { getPublicNotes } from "@/features/notes/queries";

export default async function PublicNotesPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; sort?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const page = Number(params?.page ?? "1");
  const sort = params?.sort?.trim() === "oldest" ? "oldest" : "latest";
  const { notes, totalCount, totalPages } = await getPublicNotes({ page, sort });

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-6xl space-y-8">
        <header className="glass-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">公开内容</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">浏览公开分享的知识卡片</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
            这里展示的是已经设置为公开的 Note。你可以把它理解成个人知识库对外可见的内容橱窗。
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-border bg-surface/80 px-5 py-4 text-sm text-muted">
          <p>共 {totalCount} 条公开内容，本页显示 {notes.length} 条。</p>
          <div className="flex items-center gap-2">
            <span>排序：</span>
            <Link
              href="/public"
              className={sort === "latest" ? "font-medium text-accent" : "hover:text-foreground"}
            >
              最新优先
            </Link>
            <span>/</span>
            <Link
              href="/public?sort=oldest"
              className={sort === "oldest" ? "font-medium text-accent" : "hover:text-foreground"}
            >
              最早优先
            </Link>
          </div>
        </div>

        {notes.length > 0 ? (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              {notes.map((note, index) => (
                <article
                  key={note.id}
                  className={`soft-card page-enter overflow-hidden rounded-[2rem] stagger-${(index % 4) + 1}`}
                >
                  {note.coverImageUrl ? (
                    <div
                      className="h-52 w-full border-b border-border bg-surface"
                      style={{
                        backgroundImage: `url(${note.coverImageUrl})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                      aria-label="公开 Note 封面图"
                    />
                  ) : null}

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                      <span>作者：{note.authorName}</span>
                      <span>更新于：{new Date(note.updatedAt).toLocaleDateString("zh-CN")}</span>
                    </div>

                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{note.title}</h2>
                    <p className="mt-4 text-sm leading-7 text-muted">
                      {note.summary || "这条公开内容还没有摘要，可以点击进入详情页继续阅读完整正文。"}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {note.noteTags.length > 0 ? (
                        note.noteTags.map((item) => (
                          <span
                            key={item.tag.name}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted"
                          >
                            {item.tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-dashed border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                          暂无标签
                        </span>
                      )}
                    </div>

                    <div className="mt-6">
                      <Link
                        href={`/share/${note.id}`}
                        className="button-primary inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
                      >
                        阅读公开页
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <PaginationControls basePath="/public" page={page} totalPages={totalPages} params={{ sort }} />
          </>
        ) : (
          <div className="soft-card rounded-[2rem] p-10 text-center">
            <h2 className="text-2xl font-semibold text-foreground">还没有公开内容</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              先把某条 Note 的可见性切换成“公开”，这里就会显示出来。
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/"
            className="button-secondary rounded-full border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-surface-strong"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
