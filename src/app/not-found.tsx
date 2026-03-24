import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-3xl rounded-[2rem] border border-border/70 bg-surface/90 p-8 text-center shadow-[0_20px_80px_rgba(31,41,55,0.08)] backdrop-blur-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">Not Found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">这条内容不存在</h1>
        <p className="mt-4 text-base leading-8 text-muted">
          可能这条 Note 已被删除，或者当前地址不正确。你可以回到仪表盘继续查看其它内容。
        </p>
        <Link
          href="/dashboard"
          className="button-primary mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-strong"
        >
          返回仪表盘
        </Link>
      </div>
    </main>
  );
}
