import Link from "next/link";

const quickSteps = [
  "完成邮箱注册与登录",
  "创建第一条知识卡片",
  "用标签和搜索管理内容",
  "部署到 Vercel 并对外访问",
];

export default function Home() {
  return (
    <main className="bg-background relative min-h-screen overflow-hidden px-6 pt-10 pb-8 sm:px-10 lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(20,83,45,0.18),_transparent_62%)]" />
      <div className="float-soft pointer-events-none absolute top-24 right-[-8rem] h-72 w-72 rounded-full bg-[rgba(20,83,45,0.08)] blur-3xl" />
      <div className="float-soft pointer-events-none absolute top-72 left-[-6rem] h-64 w-64 rounded-full bg-[rgba(120,53,15,0.08)] blur-3xl" />

      <section className="page-enter relative z-10 mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-6xl flex-col justify-center">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="fade-in border-accent/15 bg-accent/10 text-accent inline-flex rounded-full border px-4 py-2 text-sm font-medium">
              Next.js + Supabase + Prisma + Vercel
            </span>

            <h1 className="page-enter stagger-1 text-foreground mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              做一个真的能上线，也真的能陪你成长的个人知识库。
            </h1>

            <p className="page-enter stagger-2 text-muted mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
              从登录鉴权、数据库建模、搜索与筛选，到真实部署、公开分享和线上排错，这个项目会把你最需要的一整条全栈主线真正走通。
            </p>

            <div className="page-enter stagger-3 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="button-primary bg-accent hover:bg-accent-strong inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-medium !text-white"
              >
                进入登录页
              </Link>
              <Link
                href="/public"
                className="button-secondary border-border bg-surface hover:bg-surface-strong inline-flex items-center justify-center rounded-full border px-7 py-3.5 text-base font-medium"
              >
                浏览公开内容
              </Link>
            </div>

            <div className="page-enter stagger-4 mt-10 grid gap-3 sm:grid-cols-2">
              {quickSteps.map((step) => (
                <div key={step} className="soft-card interactive-card rounded-3xl px-5 py-4">
                  <p className="text-foreground text-sm leading-6">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="page-enter stagger-2 relative">
            <div className="glass-card rounded-[2rem] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm font-medium">当前阶段</p>
                  <h2 className="text-foreground mt-2 text-3xl font-semibold">从骨架走向产品</h2>
                </div>
                <span className="bg-accent/10 text-accent rounded-full px-3 py-1 text-sm font-medium">
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
                    className={`soft-card page-enter rounded-3xl p-5 stagger-${index + 1}`}
                  >
                    <p className="text-accent text-sm font-medium">{title}</p>
                    <p className="text-muted mt-2 text-sm leading-6">{description}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-[linear-gradient(135deg,_rgba(20,83,45,0.12),_rgba(255,255,255,0.82))] p-5">
                <p className="text-accent text-sm font-medium">你现在已经完成</p>
                <p className="text-foreground mt-2 text-sm leading-6">
                  登录、用户同步、Note
                  CRUD、图片上传、详情编辑、搜索、标签筛选和公开分享。接下来更像是在继续完善内容分发和管理体验。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

