import Link from "next/link";

type DashboardFilterPanelProps = {
  query: string;
  selectedTag: string;
  tags: string[];
  sort: string;
};

function createFilterHref(tag?: string, query?: string, sort?: string) {
  const params = new URLSearchParams();

  if (query) {
    params.set("query", query);
  }

  if (tag) {
    params.set("tag", tag);
  }

  if (sort && sort !== "latest") {
    params.set("sort", sort);
  }

  const search = params.toString();
  return search ? "/dashboard?" + search : "/dashboard";
}

export function DashboardFilterPanel({
  query,
  selectedTag,
  tags,
  sort,
}: DashboardFilterPanelProps) {
  return (
    <div className="glass-card rounded-[2rem] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">标签筛选</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            支持按标题、摘要、正文搜索，也可以按标签快速筛选。这里只展示当前列表里实际出现的标签。
          </p>
        </div>
        <Link
          href="/dashboard"
          className="button-secondary rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface-strong"
        >
          清空筛选
        </Link>
      </div>

      <form method="GET" className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]">
        <input
          type="text"
          name="query"
          defaultValue={query}
          placeholder="搜索标题、摘要或正文"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent"
        >
          <option value="latest">最新优先</option>
          <option value="oldest">最早优先</option>
        </select>
        <input type="hidden" name="tag" value={selectedTag} />
        <button
          type="submit"
          className="button-primary rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
        >
          搜索
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={createFilterHref(undefined, query, sort)}
          className={
            "button-secondary rounded-full px-4 py-2 text-sm font-medium " +
            (!selectedTag
              ? "bg-accent text-white"
              : "border border-accent/20 bg-surface text-[#1f2937] hover:border-accent/35 hover:bg-surface-strong hover:text-[#0f172a]")
          }
        >
          全部标签
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={createFilterHref(tag, query, sort)}
            className={
              "button-secondary rounded-full px-4 py-2 text-sm font-medium " +
              (selectedTag === tag
                ? "bg-accent text-white"
                : "border border-accent/20 bg-surface text-[#1f2937] hover:border-accent/35 hover:bg-surface-strong hover:text-[#0f172a]")
            }
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
