import { BackButton } from "@/components/back-button";

const milestones = [
  "初始化 Next.js、本地环境和可部署配置。",
  "设计 users、notes、tags、note_tags 的 Prisma 数据模型。",
  "接入 Supabase Auth，保护需要登录的页面和路由。",
  "完成 Note CRUD、标签筛选和搜索的 MVP 版本。",
];

export default function ProductRequirementsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-4xl rounded-[2rem] border border-border/70 bg-surface/90 p-8 shadow-[0_20px_80px_rgba(31,41,55,0.08)] backdrop-blur-sm sm:p-10">
        <BackButton className="button-secondary rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface-strong" />
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.3em] text-accent">需求概览</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">My Knowledge 最小可用版本</h1>
        <p className="mt-6 text-base leading-8 text-muted sm:text-lg">
          这个应用是一个个人知识库和收藏夹系统，目标是通过真实产品场景学习一整套全栈开发、上线和持续迭代流程。
        </p>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="soft-card page-enter stagger-1 rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-foreground">核心功能</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li>用户注册、登录和退出</li>
              <li>支持标题、摘要、正文的知识卡片 CRUD</li>
              <li>支持标签、搜索和公开/私密可见性</li>
              <li>后续支持上传、收藏和置顶</li>
            </ul>
          </div>

          <div className="soft-card page-enter stagger-2 rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-foreground">技术栈</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <li>Next.js App Router</li>
              <li>Prisma + PostgreSQL</li>
              <li>Supabase Auth 与 Storage</li>
              <li>Vercel 部署流程</li>
            </ul>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-foreground">里程碑</h2>
          <div className="mt-5 space-y-4">
            {milestones.map((milestone, index) => (
              <div key={milestone} className={`soft-card page-enter flex items-start gap-3 rounded-2xl px-4 py-4 stagger-${(index % 4) + 1}`}>
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-accent" />
                <p className="text-sm leading-6 text-foreground">{milestone}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-[linear-gradient(135deg,_rgba(20,83,45,0.09),_rgba(255,255,255,0.6))] p-6">
          <h2 className="text-xl font-semibold text-foreground">文档位置</h2>
          <p className="mt-3 text-sm leading-6 text-foreground">
            更完整的规划也已经存放在仓库里的 `docs/product-requirements.md` 和 `fullstack-learning-plan.md` 中，后续可以继续补设计细节和开发记录。
          </p>
        </section>
      </div>
    </main>
  );
}
