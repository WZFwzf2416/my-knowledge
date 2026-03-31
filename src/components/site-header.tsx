"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/public", label: "公开内容" },
  { href: "/dashboard", label: "仪表盘" },
  { href: "/ai", label: "AI 状态" },
  { href: "/login", label: "登录" },
  { href: "/profile", label: "个人资料" },
  { href: "/docs/product-requirements", label: "需求文档" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(255,253,248,0.92),rgba(244,239,230,0.86))] px-4 py-4 shadow-[0_18px_70px_rgba(31,41,55,0.09)] backdrop-blur-xl sm:px-5 lg:px-6">
          <div className="pointer-events-none absolute inset-y-0 right-[-4rem] w-48 rounded-full bg-[radial-gradient(circle,rgba(20,83,45,0.14),transparent_68%)] blur-2xl" />
          <div className="pointer-events-none absolute left-20 top-[-2.5rem] h-20 w-28 rounded-full bg-[radial-gradient(circle,rgba(120,53,15,0.12),transparent_72%)] blur-2xl" />

          <div className="relative flex items-center justify-between gap-4">
            <Link href="/" className="group flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(145deg,#14532d,#0b3b20)] text-sm font-semibold tracking-[0.16em] !text-white shadow-[0_14px_30px_rgba(20,83,45,0.24)] transition-transform duration-200 group-hover:-translate-y-0.5">
                MK
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-[0.28em] text-accent">MY KNOWLEDGE</p>
                <p className="truncate text-xs text-muted">全栈学习与真实上线项目</p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-1 rounded-full border border-border/70 bg-white/50 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                {navItems.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 " +
                        (active
                          ? "bg-[linear-gradient(145deg,#14532d,#0b3b20)] !text-white shadow-[0_10px_24px_rgba(20,83,45,0.2)]"
                          : "text-foreground/80 hover:bg-surface hover:text-foreground")
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
