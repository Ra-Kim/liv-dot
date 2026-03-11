"use client";

import { LiveDotEvent, RequirementKey } from "@/types/event";
import { getReadinessProgress } from "@/lib/eventMachine";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Lock } from "lucide-react";

interface ReadinessChecklistProps {
  event: LiveDotEvent;
  onOpenModal: (key: RequirementKey) => void;
}

// States where the checklist rows are clickable
const INTERACTIVE_STATES = ["draft", "scheduled", "ready"];

// What each requirement row's CTA says
const ROW_CTA: Record<RequirementKey, string> = {
  crew_assigned:      "Assign crew",
  ingest_configured:  "Configure source",
  pricing_configured: "Set pricing",
  tech_check_done:    "Run tech check",
};

export function ReadinessChecklist({ event, onOpenModal }: ReadinessChecklistProps) {
  const progress = getReadinessProgress(event);
  const isInteractive = INTERACTIVE_STATES.includes(event.state);
  const allDone = progress === 100;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-zinc-900/60 p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Readiness Checklist
        </h2>
        <span className={cn("font-mono text-xs font-medium", allDone ? "text-emerald-400" : "text-amber-400")}>
          {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            allDone ? "bg-emerald-400" : "bg-linear-to-r from-amber-500 to-emerald-400"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Requirements list */}
      <ul className="space-y-2">
        {event.requirements.map((req) => {
          const canClick = isInteractive;

          return (
            <li key={req.key}>
              <button
                disabled={!canClick}
                onClick={() => canClick && onOpenModal(req.key)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
                  canClick
                    ? "hover:bg-white/4 cursor-pointer"
                    : "cursor-default"
                )}
              >
                {/* Checkbox indicator */}
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all",
                    req.completed
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-600",
                    canClick && !req.completed && "group-hover:border-zinc-500"
                  )}
                >
                  {req.completed && <Check className="h-2.5 w-2.5" />}
                </span>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      req.completed ? "text-zinc-500 line-through decoration-zinc-700" : "text-zinc-200"
                    )}
                  >
                    {req.label}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-600">{req.description}</p>
                </div>

                {/* Right side — CTA or lock */}
                {canClick ? (
                  <span
                    className={cn(
                      "shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all",
                      req.completed
                        ? "text-zinc-600 group-hover:text-zinc-400"
                        : "text-amber-400/80 group-hover:text-amber-400"
                    )}
                  >
                    {req.completed ? "Edit" : ROW_CTA[req.key]}
                    <ChevronRight className="h-3 w-3" />
                  </span>
                ) : (
                  <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-700" />
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* All done banner */}
      {allDone && isInteractive && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">
            All requirements satisfied — ready to advance
          </span>
        </div>
      )}
    </div>
  );
}