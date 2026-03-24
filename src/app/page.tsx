import Link from "next/link";

const quickSteps = [
  "完成邮箱注册与登录",
  "创建第一条知识卡片",
  "用标签和搜索管理内容",
  "部署到 Vercel 并对外访问",
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-8 pt-10 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.18),_transparent_62%)]" />
      <div className="pointer-events-none absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(20,83,45,0.08)] blur-3xl float-soft" />
      <div className="pointer-events-none absolute left-[-6rem] top-72 h-64 w-64 rounded-full bg-[rgba(120,53,15,0.08)] blur-3xl float-soft" />

      <section className="page-enter relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-6xl flex-col justify-center">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="fade-in inline-flex rounded-full border border-accent/15 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
              Next.js + Supabase + Prisma + Vercel
            </span>

            <h1 className="page-enter stagger-1 mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              做一个真的能上线，也真的能陪你成长的个人知识库。
            </h1>

            <p className="page-enter stagger-2 mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
              从登录鉴权、数据库建模、搜索与筛选，到真实部署和线上排错，这个项目会把你最需要的一整条全栈主线真正走通。
            </p>

            <div className="page-enter stagger-3 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="button-primary inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-base font-medium text-white hover:bg-accent-strong"
              >
                进入登录页
              </Link>
              <Link
                href="/docs/product-requirements"
                className="button-secondary inline-flex items-center justify-center rounded-full border border-border bg-surface px-7 py-3.5 text-base font-medium hover:bg-surface-strong"
              >
                查看需求文档
              </Link>
            </div>

            <div className="page-enter stagger-4 mt-10 grid gap-3 sm:grid-cols-2">
              {quickSteps.map((step) => (
                <div
                  key={step}
                  className="soft-card interactive-card rounded-3xl px-5 py-4"
                >
                  <p className="text-sm leading-6 text-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="page-enter stagger-2 relative">
            <div className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">当前阶段</p>
                  <h2 className="mt-2 text-3xl font-semibold text-foreground">从骨架走向产品</h2>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                  Sprint A
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["统一导航与视觉系统", "让所有页面都像同一个产品，而不是临时拼起来的功能页。"],
                  ["完善交互反馈", "把 loading、空状态、错误状态和成功提示统一起来。"],
                  ["为部署收口", "保证本地和生产环境在体验和结构上保持一致。"],
                ].map(([title, description], index) => (
                  <div
                    key={title}
                    className={`soft-card rounded-3xl p-5 page-enter stagger-${index + 1}`}
                  >
                    <p className="text-sm font-medium text-accent">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-[linear-gradient(135deg,_rgba(20,83,45,0.12),_rgba(255,255,255,0.82))] p-5">
                <p className="text-sm font-medium text-accent">你现在已经完成</p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  登录、用户同步、Note CRUD、详情编辑、搜索和标签筛选。接下来更像是在把它变成一个真正让人愿意继续使用的产品。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
