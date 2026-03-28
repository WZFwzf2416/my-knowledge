import Link from "next/link";
import { getPublicNoteDetail } from "@/features/notes/queries";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getPublicNoteDetail(id);

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-4xl space-y-6">
        <header className="glass-card rounded-[2rem] overflow-hidden">
          {note.coverImageUrl ? (
            <div
              className="h-64 w-full border-b border-border bg-surface"
              style={{
                backgroundImage: `url(${note.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
              aria-label="公开 Note 封面图"
            />
          ) : null}

          <div className="p-8 sm:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">公开分享</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">{note.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>作者：{note.authorName}</span>
              <span>最近更新：{new Date(note.updatedAt).toLocaleString("zh-CN")}</span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-accent">{note.visibility === "PUBLIC" ? "公开" : "私密"}</span>
            </div>
            {note.summary ? <p className="mt-5 text-base leading-8 text-muted">{note.summary}</p> : null}
          </div>
        </header>

        <section className="soft-card rounded-[2rem] p-8 sm:p-10">
          <div className="prose prose-neutral max-w-none text-foreground">
            <p className="whitespace-pre-wrap text-base leading-8">{note.content}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
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
        </section>

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
