export function ForgeSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#0A0C18] flex flex-col animate-pulse">
      {/* TopNav Skeleton */}
      <div className="h-16 border-b border-zinc-800/80 bg-[#0E1022]/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80" />
          <div className="w-32 h-5 rounded-md bg-zinc-800/80" />
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-8 rounded-full bg-zinc-800/60" />
          <div className="w-24 h-8 rounded-full bg-zinc-800/60" />
        </div>
        <div className="w-28 h-9 rounded-xl bg-zinc-800/80" />
      </div>

      {/* Main Altar Skeleton */}
      <main className="mx-auto w-full max-w-7xl px-3 sm:px-6 pt-4 sm:pt-8 pb-24 md:pb-8 flex-1 flex flex-col gap-6 sm:gap-8">
        <section className="relative w-full rounded-3xl border border-zinc-800/60 bg-[#0E1022]/60 p-6 sm:p-10 flex flex-col items-center">
          <div className="w-48 h-6 rounded-full bg-purple-950/40 mb-3" />
          <div className="w-64 h-8 rounded-lg bg-zinc-800/60 mb-2" />
          <div className="w-96 max-w-full h-4 rounded bg-zinc-800/40 mb-8" />

          {/* Slots & Altar Center */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 w-full">
            <div className="w-48 sm:w-52 h-64 rounded-2xl border-2 border-dashed border-zinc-800 bg-black/40" />
            <div className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-cyan-500/20 bg-cyan-950/20 animate-pulse" />
              <div className="w-48 h-12 rounded-2xl bg-zinc-800/80" />
            </div>
            <div className="w-48 sm:w-52 h-64 rounded-2xl border-2 border-dashed border-zinc-800 bg-black/40" />
          </div>
        </section>

        {/* Inventory Drawer Skeleton */}
        <section className="rounded-3xl border border-zinc-800/60 bg-[#0E1022]/60 p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="w-40 h-6 rounded bg-zinc-800/60" />
            <div className="w-24 h-4 rounded bg-zinc-800/40" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-48 h-64 shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/40"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
