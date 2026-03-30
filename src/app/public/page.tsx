import type { Metadata } from "next";
import Link from "next/link";
import { PaginationControls } from "@/components/pagination-controls";
import { getPublicNotes } from "@/features/notes/queries";

export const metadata: Metadata = {
  title: "公开内容",
  description: "浏览公开分享的知识卡片，查看封面、摘要、标签和最近更新内容。",
  openGraph: {
    title: "公开内容 | My Knowledge",
    description: "浏览公开分享的知识卡片，查看封面、摘要、标签和最近更新内容。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "公开内容 | My Knowledge",
    description: "浏览公开分享的知识卡片，查看封面、摘要、标签和最近更新内容。",
  },
};

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
    <main className="bg-background min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-6xl space-y-8">
        <header className="glass-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-accent text-sm font-medium uppercase tracking-[0.3em]">公开内容</p>
          <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight">
            浏览公开分享的知识卡片
          </h1>
          <p className="text-muted mt-4 max-w-3xl text-base leading-8 sm:text-lg">
            这里展示的是已经设置为公开的 Note。你可以把它理解成个人知识库对外可见的内容窗口。
          </p>
        </header>

        <div className="border-border bg-surface/80 text-muted flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border px-5 py-4 text-sm">
          <p>
            共 {totalCount} 条公开内容，本页显示 {notes.length} 条。
          </p>
          <div className="flex items-center gap-2">
            <span>排序：</span>
            <Link
              href="/public"
              className={sort === "latest" ? "text-accent font-medium" : "hover:text-foreground"}
            >
              最新优先
            </Link>
            <span>/</span>
            <Link
              href="/public?sort=oldest"
              className={sort === "oldest" ? "text-accent font-medium" : "hover:text-foreground"}
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
                      className="border-border bg-surface h-52 w-full border-b"
                      style={{
                        backgroundImage: `url(${note.coverImageUrl})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                      aria-label="公开 Note 封面图"
                    />
                  ) : null}

                  <div className="p-6">
                    <div className="text-muted flex flex-wrap items-center gap-3 text-sm">
                      <span>作者：{note.authorName}</span>
                      <span>更新于：{new Date(note.updatedAt).toLocaleDateString("zh-CN")}</span>
                      <span>阅读量：{note.viewCount}</span>
                    </div>

                    <h2 className="text-foreground mt-4 text-2xl font-semibold tracking-tight">
                      {note.title}
                    </h2>
                    <p className="text-muted mt-4 text-sm leading-7">
                      {note.summary || "这条公开内容还没有摘要，可以点击进入详情页继续阅读完整正文。"}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {note.noteTags.length > 0 ? (
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

                    <div className="mt-6">
                      <Link
                        href={`/share/${note.id}`}
                        className="button-primary bg-accent hover:bg-accent-strong inline-flex rounded-full px-5 py-3 text-sm font-medium !text-white"
                      >
                        阅读公开页
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <PaginationControls
              basePath="/public"
              page={page}
              totalPages={totalPages}
              params={{ sort }}
            />
          </>
        ) : (
          <div className="soft-card rounded-[2rem] p-10 text-center">
            <h2 className="text-foreground text-2xl font-semibold">还没有公开内容</h2>
            <p className="text-muted mt-4 text-sm leading-7">
              先把某条 Note 的可见性切换成“公开”，这里就会显示出来。
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/"
            className="button-secondary border-border bg-background hover:bg-surface-strong rounded-full border px-6 py-3 text-sm font-medium"
          >
            返回首页
          </Link>
        </div>
      </div>
    </main>
  );
}
