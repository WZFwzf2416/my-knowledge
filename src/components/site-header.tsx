import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/public", label: "公开内容" },
  { href: "/dashboard", label: "仪表盘" },
  { href: "/login", label: "登录" },
  { href: "/profile", label: "个人资料" },
  { href: "/docs/product-requirements", label: "需求文档" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-border/70 bg-surface/85 px-5 py-3 shadow-[0_14px_50px_rgba(31,41,55,0.08)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
            MK
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-accent">MY KNOWLEDGE</p>
            <p className="text-xs text-muted">全栈学习与真实上线项目</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="button-secondary rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-strong"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
