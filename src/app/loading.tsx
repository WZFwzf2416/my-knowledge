export default function Loading() {
  return (
    <main className="min-h-screen px-6 py-12 sm:px-10 lg:px-12">
      <div className="page-enter mx-auto max-w-6xl space-y-6">
        <div className="glass-card h-56 rounded-[2rem] p-8">
          <div className="shimmer-surface h-6 w-40 rounded-full" />
          <div className="shimmer-surface mt-5 h-12 w-2/3 rounded-2xl" />
          <div className="shimmer-surface mt-5 h-5 w-full rounded-full" />
          <div className="shimmer-surface mt-3 h-5 w-5/6 rounded-full" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="glass-card h-[36rem] rounded-[2rem] p-6">
            <div className="shimmer-surface h-full rounded-[1.5rem]" />
          </div>
          <div className="space-y-4">
            <div className="soft-card shimmer-surface h-40 rounded-[2rem]" />
            <div className="soft-card shimmer-surface h-40 rounded-[2rem]" />
            <div className="soft-card shimmer-surface h-40 rounded-[2rem]" />
          </div>
        </div>
      </div>
    </main>
  );
}
