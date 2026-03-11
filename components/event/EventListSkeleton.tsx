export function EventCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-zinc-900/60 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded bg-zinc-800" />
          <div className="h-3 w-1/4 rounded bg-zinc-800" />
        </div>
        <div className="h-5 w-20 rounded-full bg-zinc-800" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-4/5 rounded bg-zinc-800" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-3 w-28 rounded bg-zinc-800" />
        <div className="h-3 w-16 rounded bg-zinc-800" />
        <div className="h-3 w-20 rounded bg-zinc-800" />
      </div>
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}