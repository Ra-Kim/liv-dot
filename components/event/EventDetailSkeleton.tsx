export function EventDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-5 w-24 rounded-full bg-zinc-800" />
        <div className="h-8 w-2/3 rounded bg-zinc-800" />
        <div className="h-4 w-1/4 rounded bg-zinc-800" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full rounded bg-zinc-800" />
          <div className="h-3 w-4/5 rounded bg-zinc-800" />
        </div>
        <div className="flex gap-6 pt-4">
          <div className="h-3 w-32 rounded bg-zinc-800" />
          <div className="h-3 w-20 rounded bg-zinc-800" />
          <div className="h-3 w-24 rounded bg-zinc-800" />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-24 rounded-xl bg-zinc-900/60" />

      {/* Two columns */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 rounded-xl bg-zinc-900/60" />
        <div className="h-48 rounded-xl bg-zinc-900/60" />
      </div>
    </div>
  );
}