"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter border-border/70 bg-surface/90 mx-auto max-w-3xl rounded-[2rem] border p-8 shadow-[0_20px_80px_rgba(31,41,55,0.08)] backdrop-blur-sm">
        <p className="text-danger text-sm font-medium tracking-[0.3em] uppercase">页面错误</p>
        <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight">
          这一步没有成功完成
        </h1>
        <p className="text-muted mt-4 text-base leading-8">
          {error.message || "发生了未知错误。你可以先重试一次，如果仍然失败，再把终端报错贴给我。"}
        </p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="button-primary bg-accent hover:bg-accent-strong rounded-full px-6 py-3 text-sm font-medium !text-white"
          >
            重新加载页面
          </button>
        </div>
      </div>
    </main>
  );
}

