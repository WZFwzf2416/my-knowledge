import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="px-6 pt-12 pb-8 sm:px-10 lg:px-12">
      <div className="border-border/70 bg-surface/75 text-muted mx-auto flex max-w-6xl flex-col gap-4 rounded-[2rem] border px-6 py-6 text-sm shadow-[0_12px_48px_rgba(31,41,55,0.05)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-foreground font-medium">My Knowledge</p>
          <p className="mt-1">把学习、编码、部署和复盘串成一条真实的全栈成长路径。</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/docs/product-requirements"
            className="button-secondary hover:text-foreground"
          >
            需求文档
          </Link>
          <Link href="/dashboard" className="button-secondary hover:text-foreground">
            仪表盘
          </Link>
        </div>
      </div>
    </footer>
  );
}
