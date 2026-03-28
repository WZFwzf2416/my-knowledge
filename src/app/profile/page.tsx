import Link from "next/link";
import { AvatarUploadField } from "@/components/avatar-upload-field";
import { updateProfileAction } from "@/features/profile/actions";
import { getProfilePageData } from "@/features/profile/queries";
import { hasSupabaseEnv } from "@/lib/env";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const message = params?.message;
  const profile = await getProfilePageData();
  const fallbackLabel = profile.nickname?.trim()?.[0]?.toUpperCase() ?? profile.email[0]?.toUpperCase() ?? "M";

  return (
    <main className="min-h-screen bg-background px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-6xl space-y-6">
        <header className="glass-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent">个人资料</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">完善你的个人信息</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted sm:text-lg">
                这一页对齐了学习规划里的“个人资料页”“表单校验”和“文件上传”。现在头像流程已经改成先选图预览，再统一保存，交互会更接近真实产品。
              </p>
            </div>
            <Link
              href="/dashboard"
              className="button-secondary rounded-full border border-border bg-background px-5 py-3 text-sm font-medium hover:bg-surface-strong"
            >
              返回仪表盘
            </Link>
          </div>
        </header>

        {message ? (
          <div className="fade-in rounded-[2rem] border border-accent/20 bg-accent/10 px-6 py-4 text-sm leading-6 text-foreground">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <form action={updateProfileAction} className="glass-card rounded-[2rem] p-8">
            <div className="grid gap-5">
              <label className="block text-sm text-muted">
                邮箱
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="mt-2 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-foreground opacity-70"
                />
              </label>

              <AvatarUploadField
                initialAvatarUrl={profile.avatarUrl}
                canUpload={hasSupabaseEnv}
                fallbackLabel={fallbackLabel}
              />

              <label className="block text-sm text-muted">
                昵称
                <input
                  type="text"
                  name="nickname"
                  defaultValue={profile.nickname}
                  placeholder="给自己起一个容易识别的名字"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                />
              </label>

              <label className="block text-sm text-muted">
                个人简介
                <textarea
                  name="bio"
                  rows={5}
                  defaultValue={profile.bio}
                  placeholder="写一段关于你自己的介绍，或者记录这个项目当前的学习目标。"
                  className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors focus:border-accent"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                className="button-primary rounded-full bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-strong"
              >
                保存个人资料并同步头像
              </button>
              <p className="text-xs leading-5 text-muted">
                如果你刚刚选了新图片，点击保存时会一起上传并更新。
              </p>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-foreground">当前资料</h2>
              <div className="mt-5 flex items-center gap-4">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-semibold text-white"
                  style={
                    profile.avatarUrl
                      ? {
                          backgroundImage: `url(${profile.avatarUrl})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }
                      : undefined
                  }
                >
                  {profile.avatarUrl ? <span className="sr-only">当前头像</span> : fallbackLabel}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{profile.nickname || "未设置昵称"}</p>
                  <p className="text-sm text-muted">{profile.email}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">
                {profile.bio || "还没有填写个人简介。你可以把这里当作一块很小的个人说明，也可以记录当前项目的目标和状态。"}
              </p>
              {profile.avatarUrl ? (
                <p className="mt-4 break-all text-xs leading-6 text-muted">头像链接：{profile.avatarUrl}</p>
              ) : null}
            </div>

            <div className="soft-card rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-foreground">当前统计</h2>
              <div className="mt-5 grid gap-3">
                {profile.stats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-sm text-muted">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="soft-card rounded-[2rem] p-6 text-sm leading-6 text-muted">
              <p className="font-medium text-foreground">Storage 提示</p>
              <p className="mt-3">
                默认 bucket 名称是 `avatars`。如果保存头像失败，请先到 Supabase Storage 创建同名 bucket，并为已登录用户配置上传权限。
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
