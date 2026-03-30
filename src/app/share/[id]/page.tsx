import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { getPublicNoteDetail } from "@/features/notes/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const note = await getPublicNoteDetail(id);
  const title = `${note.title} | My Knowledge`;
  const description = note.summary || note.content.slice(0, 120);
  const url = `${env.appUrl}/share/${note.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: note.coverImageUrl ? [{ url: note.coverImageUrl, alt: note.title }] : undefined,
    },
    twitter: {
      card: note.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: note.coverImageUrl ? [note.coverImageUrl] : undefined,
    },
  };
}

export default async function PublicNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const note = await getPublicNoteDetail(id);

  return (
    <main className="bg-background min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-4xl space-y-6">
        <header className="glass-card overflow-hidden rounded-[2rem]">
          {note.coverImageUrl ? (
            <div
              className="border-border bg-surface h-64 w-full border-b"
              style={{
                backgroundImage: `url(${note.coverImageUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
              aria-label="公开 Note 封面图"
            />
          ) : null}

          <div className="p-8 sm:p-10">
            <p className="text-accent text-sm font-medium tracking-[0.3em] uppercase">公开分享</p>
            <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight">
              {note.title}
            </h1>
            <div className="text-muted mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span>作者：{note.authorName}</span>
              <span>最近更新：{new Date(note.updatedAt).toLocaleString("zh-CN")}</span>
              <span>阅读量：{note.viewCount}</span>
              <span className="bg-accent/10 text-accent rounded-full px-3 py-1">
                {note.visibility === "PUBLIC" ? "公开" : "私密"}
              </span>
            </div>
            {note.summary ? (
              <p className="text-muted mt-5 text-base leading-8">{note.summary}</p>
            ) : null}
          </div>
        </header>

        <section className="soft-card rounded-[2rem] p-8 sm:p-10">
          <div className="prose prose-neutral text-foreground max-w-none">
            <p className="text-base leading-8 whitespace-pre-wrap">{note.content}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
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
        </section>

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
