import { EventState } from "@/types/event";
import { STATE_LABELS } from "@/lib/eventMachine";
import { cn } from "@/lib/utils";

interface EventStatusBadgeProps {
  state: EventState;
  size?: "sm" | "md";
  showDot?: boolean;
}

const STATE_STYLES: Record<EventState, string> = {
  draft:
    "bg-zinc-800 text-zinc-400 border border-zinc-700",
  scheduled:
    "bg-blue-950 text-blue-300 border border-blue-800",
  ready:
    "bg-emerald-950 text-emerald-300 border border-emerald-800",
  live:
    "bg-red-950 text-red-300 border border-red-700",
  completed:
    "bg-zinc-900 text-zinc-500 border border-zinc-700",
  replay:
    "bg-violet-950 text-violet-300 border border-violet-800",
};

const DOT_STYLES: Record<EventState, string> = {
  draft: "bg-zinc-500",
  scheduled: "bg-blue-400",
  ready: "bg-emerald-400",
  live: "bg-red-400 animate-pulse",
  completed: "bg-zinc-600",
  replay: "bg-violet-400",
};

export function EventStatusBadge({
  state,
  size = "md",
  showDot = true,
}: EventStatusBadgeProps) {
  return (
    <span
      style={{ fontFamily: "var(--font-dm-mono), monospace" }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs",
        STATE_STYLES[state]
      )}
    >
      {showDot && (
        <span
          className={cn("rounded-full", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2", DOT_STYLES[state])}
        />
      )}
      {STATE_LABELS[state]}
    </span>
  );
}