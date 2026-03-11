"use client";

import { LiveDotEvent, EventState } from "@/types/event";
import { getAvailableActions } from "@/lib/eventMachine";
import { useTransitionState } from "@/hooks/useEventQueries";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";

interface ActionPanelProps {
  event: LiveDotEvent;
}

const VARIANT_STYLES = {
  primary:
    "bg-white text-zinc-900 hover:bg-zinc-100 disabled:bg-white/20 disabled:text-zinc-600",
  danger:
    "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40",
  secondary:
    "bg-zinc-800 text-zinc-300 border border-white/[0.07] hover:bg-zinc-700 disabled:opacity-40",
};

// Descriptions shown beneath the action panel per state
const STATE_CONTEXT: Partial<Record<EventState, string>> = {
  draft: "Schedule the event to begin configuring production requirements.",
  scheduled:
    "Complete all checklist items to mark the event as ready for streaming.",
  ready: "All systems go. You can start the live stream when ready.",
  live: "The event is currently streaming. End it when finished.",
  completed: "Enable replay so attendees can re-watch the event.",
  replay: "Replay is active. Attendees can watch the recording.",
};

export function ActionPanel({ event }: ActionPanelProps) {
  const actions = getAvailableActions(event);
  const { mutate: transitionState, isPending } = useTransitionState(event.id);
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);

  // "End Event" is destructive — require a confirmation click
  function handleActionClick(actionId: string, targetState: EventState) {
    if (actionId === "end_event" && confirmingAction !== actionId) {
      setConfirmingAction(actionId);
      return;
    }
    setConfirmingAction(null);
    transitionState(targetState);
  }

  const context = STATE_CONTEXT[event.state];

  if (actions.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-zinc-900/60 p-5">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Actions
        </h2>
        <p className="text-sm text-zinc-600">
          No further actions available for this event.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Actions
      </h2>

      {context && (
        <p className="mb-4 text-xs text-zinc-600">{context}</p>
      )}

      <div className="space-y-3">
        {actions.map((action) => {
          const isConfirming = confirmingAction === action.id;

          return (
            <div key={action.id}>
              <button
                disabled={action.blocked || isPending}
                onClick={() =>
                  handleActionClick(action.id, action.targetState)
                }
                className={cn(
                  "group flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                  VARIANT_STYLES[action.variant],
                  action.blocked && "cursor-not-allowed opacity-50",
                  isConfirming && "ring-2 ring-red-500/40"
                )}
              >
                <span>
                  {isConfirming ? "Confirm: End Event?" : action.label}
                </span>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin opacity-60" />
                ) : (
                  <ChevronRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-70" />
                )}
              </button>

              {/* Blocked reasons */}
              {action.blocked && action.blockedReasons.length > 0 && (
                <div className="mt-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500/70" />
                    <span className="text-xs font-medium text-amber-500/70">
                      Blocked — complete the following:
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {action.blockedReasons.map((reason) => (
                      <li
                        key={reason}
                        className="flex items-center gap-1.5 text-xs text-zinc-500"
                      >
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm cancel */}
              {isConfirming && (
                <button
                  onClick={() => setConfirmingAction(null)}
                  className="mt-1.5 w-full rounded-lg px-4 py-2 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  Cancel
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}