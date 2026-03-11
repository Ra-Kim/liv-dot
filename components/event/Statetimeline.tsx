import { EventState } from "@/types/event";
import { STATE_LABELS } from "@/lib/eventMachine";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const ORDERED_STATES: EventState[] = [
  "draft",
  "scheduled",
  "ready",
  "live",
  "completed",
  "replay",
];

interface StateTimelineProps {
  currentState: EventState;
}

export function StateTimeline({ currentState }: StateTimelineProps) {
  const currentIndex = ORDERED_STATES.indexOf(currentState);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Event Lifecycle
      </h2>

      <div className="relative flex items-center justify-between">
        {/* Connector line behind steps */}
        <div className="absolute inset-x-0 top-3.5 h-px bg-zinc-800" />
        <div
          className="absolute top-3.5 left-0 h-px bg-linear-to-r from-amber-500 to-emerald-400 transition-all duration-700"
          style={{
            width:
              currentIndex === 0
                ? "0%"
                : `${(currentIndex / (ORDERED_STATES.length - 1)) * 100}%`,
          }}
        />

        {ORDERED_STATES.map((state, index) => {
          const isPast = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div
              key={state}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              {/* Step dot */}
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300",
                  isPast &&
                    "border-emerald-500 bg-emerald-500/20 text-emerald-400",
                  isCurrent &&
                    "border-amber-400 bg-amber-400/10 text-amber-400 ring-2 ring-amber-400/20",
                  isFuture && "border-zinc-700 bg-zinc-900 text-zinc-600"
                )}
              >
                {isPast ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "hidden text-center font-mono text-[10px] leading-tight sm:block",
                  isPast && "text-zinc-500",
                  isCurrent && "font-semibold text-amber-400",
                  isFuture && "text-zinc-700"
                )}
              >
                {STATE_LABELS[state]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: just show current label */}
      <p className="mt-3 text-center font-mono text-xs text-amber-400 sm:hidden">
        {STATE_LABELS[currentState]}
      </p>
    </div>
  );
}