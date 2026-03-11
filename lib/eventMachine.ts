import { EventState, LiveDotEvent, EventAction, RequirementKey } from "@/types/event";

// Valid forward transitions for each state
export const STATE_TRANSITIONS: Record<EventState, EventState[]> = {
  draft: ["scheduled"],
  scheduled: ["ready"],
  ready: ["live"],
  live: ["completed"],
  completed: ["replay"],
  replay: [],
};

// Which requirements must be complete to move from scheduled → ready
const READY_GATE_REQUIREMENTS: RequirementKey[] = [
  "crew_assigned",
  "ingest_configured",
  "pricing_configured",
  "venue_confirmed",
  "tech_check_done",
];

// Human-readable labels for each state
export const STATE_LABELS: Record<EventState, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  ready: "Ready for Streaming",
  live: "Live",
  completed: "Completed",
  replay: "Replay Available",
};

// All possible actions keyed by the state they transition FROM
export const STATE_ACTIONS: Record<EventState, EventAction[]> = {
  draft: [
    {
      id: "schedule",
      label: "Schedule Event",
      targetState: "scheduled",
      variant: "primary",
      requires: [],
    },
  ],
  scheduled: [
    {
      id: "mark_ready",
      label: "Mark as Ready",
      targetState: "ready",
      variant: "primary",
      requires: READY_GATE_REQUIREMENTS,
    },
  ],
  ready: [
    {
      id: "go_live",
      label: "Go Live",
      targetState: "live",
      variant: "primary",
      requires: [],
    },
  ],
  live: [
    {
      id: "end_event",
      label: "End Event",
      targetState: "completed",
      variant: "danger",
      requires: [],
    },
  ],
  completed: [
    {
      id: "enable_replay",
      label: "Enable Replay",
      targetState: "replay",
      variant: "secondary",
      requires: [],
    },
  ],
  replay: [],
};

/**
 * Returns which actions are available for a given event,
 * along with whether each action is blocked and why.
 */
export function getAvailableActions(event: LiveDotEvent): Array<
  EventAction & {
    blocked: boolean;
    blockedReasons: string[];
  }
> {
  const actions = STATE_ACTIONS[event.state] ?? [];

  return actions.map((action) => {
    const blockedReasons: string[] = [];

    for (const reqKey of action.requires) {
      const req = event.requirements.find((r) => r.key === reqKey);
      if (req && !req.completed) {
        blockedReasons.push(req.label);
      }
    }

    return {
      ...action,
      blocked: blockedReasons.length > 0,
      blockedReasons,
    };
  });
}

/**
 * Returns true if the event can transition to the target state.
 */
export function canTransition(
  event: LiveDotEvent,
  targetState: EventState
): boolean {
  const actions = getAvailableActions(event);
  return actions.some(
    (a) => a.targetState === targetState && !a.blocked
  );
}

/**
 * Computes readiness progress as a percentage (0–100).
 */
export function getReadinessProgress(event: LiveDotEvent): number {
  if (event.requirements.length === 0) return 100;
  const completed = event.requirements.filter((r) => r.completed).length;
  return Math.round((completed / event.requirements.length) * 100);
}