import Link from "next/link";

type PaginationControlsProps = {
  basePath: string;
  page: number;
  totalPages: number;
  params?: Record<string, string | undefined>;
};

function createPageHref(basePath: string, targetPage: number, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  if (targetPage > 1) {
    searchParams.set("page", String(targetPage));
  }

  const search = searchParams.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function PaginationControls({
  basePath,
  page,
  totalPages,
  params = {},
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const startPage = Math.max(1, page - 1);
  const endPage = Math.min(totalPages, startPage + 2);
  const visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        href={createPageHref(basePath, previousPage, params)}
        aria-disabled={page === 1}
        className={
          "button-secondary rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface-strong " +
          (page === 1 ? "pointer-events-none opacity-50" : "")
        }
      >
        上一页
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {visiblePages.map((item) => (
          <Link
            key={item}
            href={createPageHref(basePath, item, params)}
            className={
              "rounded-full px-4 py-2 text-sm font-medium " +
              (item === page
                ? "bg-accent text-white"
                : "border border-border bg-background text-foreground hover:bg-surface-strong")
            }
          >
            {item}
          </Link>
        ))}
      </div>

      <Link
        href={createPageHref(basePath, nextPage, params)}
        aria-disabled={page === totalPages}
        className={
          "button-secondary rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface-strong " +
          (page === totalPages ? "pointer-events-none opacity-50" : "")
        }
      >
        下一页
      </Link>
    </div>
  );
}
