"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/useEventQueries";
import { EventCard } from "@/components/event/EventCard";
import { EventListSkeleton } from "@/components/event/EventListSkeleton";
import { EventState } from "@/types/event";
import { STATE_LABELS } from "@/lib/eventMachine";
import { Radio, AlertCircle, Plus } from "lucide-react";

const FILTER_STATES: Array<EventState | "all"> = [
  "all",
  "draft",
  "scheduled",
  "ready",
  "live",
  "completed",
  "replay",
];

export default function HomePage() {
  const { data: events, isLoading, isError } = useEvents();
  const [filter, setFilter] = useState<EventState | "all">("all");

  const filtered =
    filter === "all" ? events : events?.filter((e) => e.state === filter);

  const liveCount = events?.filter((e) => e.state === "live").length ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top nav */}
      <header className="border-b border-white/6 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
              <Radio className="h-4 w-4 text-amber-400" />
            </div>
            <span style={{ fontFamily: "var(--font-syne), sans-serif" }} className="text-sm font-semibold tracking-tight text-white">
              LIV<span className="text-amber-400">.</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {liveCount > 0 && (
              <span style={{ fontFamily: "var(--font-dm-mono), monospace" }} className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                {liveCount} live
              </span>
            )}
            <button className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-opacity hover:opacity-90">
              <Plus className="h-3.5 w-3.5" />
              New Event
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "var(--font-syne), sans-serif" }} className="text-2xl font-bold tracking-tight text-white">
            Your Events
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {events?.length ?? 0} events ·{" "}
            {events?.filter((e) => e.state === "live").length ?? 0} streaming
            now
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTER_STATES.map((state) => (
            <button
              key={state}
              onClick={() => setFilter(state)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === state
                  ? "bg-zinc-800 text-white ring-1 ring-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {state === "all"
                ? `All${events ? ` (${events.length})` : ""}`
                : STATE_LABELS[state]}
              {state !== "all" && events && (
                <span className="ml-1.5 font-mono text-zinc-600">
                  {events.filter((e) => e.state === state).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* States */}
        {isLoading && <EventListSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-900/40 bg-red-950/20 py-16 text-center">
            <AlertCircle className="mb-3 h-8 w-8 text-red-500/60" />
            <p className="text-sm font-medium text-red-400">
              Failed to load events
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Please try refreshing the page.
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered?.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/6 bg-zinc-900/40 py-20 text-center">
            <p className="text-sm font-medium text-zinc-400">No events found</p>
            <p className="mt-1 text-xs text-zinc-600">
              {filter === "all"
                ? "Create your first event to get started."
                : `No events with state "${STATE_LABELS[filter as EventState]}".`}
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}