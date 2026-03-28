import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction, signupAction } from "@/features/auth/actions";
import { getOptionalAuthUser } from "@/features/auth/server";
import { hasSupabaseEnv } from "@/lib/env";

const steps = [
  "创建 Supabase 项目并开启邮箱登录",
  "把 URL、匿名 Key 和 DATABASE_URL 写入 .env.local",
  "使用这个页面完成第一次真实注册和登录",
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const message = params?.message;
  const user = await getOptionalAuthUser();

  if (hasSupabaseEnv && user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_420px]">
        <section className="glass-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">
            登录模块
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            现在可以直接注册、登录并进入仪表盘
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
            配置好 Supabase 环境变量之后，这个页面就会成为你真实的认证入口。完成登录后，页面会跳转到仪表盘并读取实际数据。
          </p>

          {message ? (
            <div className="fade-in mt-6 rounded-3xl border border-accent/20 bg-accent/10 px-5 py-4 text-sm leading-6 text-foreground">
              {message}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`soft-card page-enter rounded-3xl p-5 stagger-${index + 1}`}
              >
                <p className="text-sm font-medium text-accent">步骤 {index + 1}</p>
                <p className="mt-3 text-sm leading-6 text-foreground">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form
              action={loginAction}
              className="soft-card interactive-card rounded-[2rem] p-6"
            >
              <h2 className="text-2xl font-semibold text-foreground">登录</h2>
              <div className="mt-5 space-y-4">
                <label className="block text-sm text-muted">
                  邮箱
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                    required
                  />
                </label>
                <label className="block text-sm text-muted">
                  密码
                  <input
                    type="password"
                    name="password"
                    placeholder="至少 6 位"
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="button-primary mt-6 w-full rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
              >
                登录并进入仪表盘
              </button>
            </form>

            <form
              action={signupAction}
              className="soft-card interactive-card rounded-[2rem] p-6"
            >
              <h2 className="text-2xl font-semibold text-foreground">注册</h2>
              <div className="mt-5 space-y-4">
                <label className="block text-sm text-muted">
                  邮箱
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                    required
                  />
                </label>
                <label className="block text-sm text-muted">
                  密码
                  <input
                    type="password"
                    name="password"
                    placeholder="至少 6 位"
                    className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="button-secondary mt-6 w-full rounded-full border border-border bg-surface px-5 py-3 text-sm font-medium hover:bg-surface-strong"
              >
                创建账号
              </button>
            </form>
          </div>
        </section>

        <section className="page-enter stagger-2 rounded-[2rem] border border-border/70 bg-surface/80 p-8 shadow-[0_20px_80px_rgba(31,41,55,0.08)] backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-foreground">环境状态</h2>
          <div className="soft-card mt-6 rounded-3xl p-5">
            <p className="text-sm font-medium text-muted">Supabase 配置</p>
            <p className="mt-3 text-base font-medium text-foreground">
              {hasSupabaseEnv ? "已配置，可以直接测试认证流程。" : "未配置，表单会提示你先填写环境变量。"}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              把 `.env.example` 复制为 `.env.local`，填入 `NEXT_PUBLIC_SUPABASE_URL`、
              `NEXT_PUBLIC_SUPABASE_ANON_KEY` 和 `DATABASE_URL` 后，就可以开始走真实链路。
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/dashboard"
              className="button-primary flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent-strong"
            >
              查看仪表盘
            </Link>
            <Link
              href="/docs/product-requirements"
              className="button-secondary flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-surface-strong"
            >
              返回需求文档
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}