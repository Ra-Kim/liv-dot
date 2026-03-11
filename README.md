# LIV DOT — Host Event Dashboard

A host-facing event management interface built with Next.js, TypeScript, Tailwind CSS v4, and TanStack Query.

## Setup

**Prerequisites:** Node.js v18+, npm v9+

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd liv-dot

# 2. Install dependencies
npm install

# 3. Install required packages (if not already present)
npm install @tanstack/react-query @tanstack/react-query-devtools lucide-react clsx tailwind-merge

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> All data is simulated in-memory. No backend or environment variables are required.

---

## Pages

| Route | Description |
|---|---|
| `/` | Event list — filterable by state, shows readiness progress bar on draft/scheduled cards |
| `/events/[id]` | Event detail — lifecycle timeline, readiness checklist, action panel, all modals |

### Detail page behaviour
- Each checklist row opens a dedicated modal for its requirement
- The **Schedule Event** action in the action panel also opens the schedule modal (not a direct state transition)
- State transitions fire from the action panel; destructive actions require a confirmation click
- Unchecking any requirement while the event is `ready` automatically demotes it back to `scheduled`

---

## Project Structure

```
src/
├── types/event.ts                   # All TypeScript interfaces
├── lib/
│   ├── eventMachine.ts              # Pure state transition logic, action gating, readiness %
│   ├── eventService.ts              # In-memory backend simulation with async delays
│   ├── mockData.ts                  # 5 seeded events covering every state
│   ├── mockCrew.ts                  # 8 crew members for the crew assignment roster
│   └── queryKeys.ts                 # TanStack Query key factory
├── hooks/
│   └── useEventQueries.ts           # All queries + mutations with optimistic updates
├── components/
│   ├── event/
│   │   ├── EventCard.tsx            # List page card with readiness bar
│   │   ├── EventStatusBadge.tsx     # Semantic state pill (pulsing dot for live)
│   │   ├── EventDetailHeader.tsx    # Title, host, meta, live banner
│   │   ├── ReadinessChecklist.tsx   # Requirement rows → open modals via onOpenModal
│   │   ├── ActionPanel.tsx          # State transition buttons; schedule opens modal
│   │   ├── StateTimeline.tsx        # Horizontal lifecycle progress
│   │   └── EventDetailSkeleton.tsx  # Loading state
│   ├── modals/
│   │   ├── ScheduleModal.tsx        # Date/time picker → saves date, draft→scheduled
│   │   ├── PricingModal.tsx         # Free toggle + price input
│   │   ├── StreamIngestModal.tsx    # 5 source types with conditional config fields
│   │   ├── CrewModal.tsx            # Assign/remove crew from roster
│   │   ├── TechCheckModal.tsx       # 5 sub-items + sign-off action
│   │   └── RequirementModals.tsx    # Orchestrator + useRequirementModal hook
│   └── ui/
│       └── Modal.tsx                # Base modal: backdrop, Escape key, scroll lock
└── app/
    ├── page.tsx                     # Home — filterable event list
    └── events/[id]/page.tsx         # Detail page — owns modal state, passes openModal down
```

---

## How It Works

### State machine
`eventMachine.ts` defines valid transitions as a plain `Record<EventState, EventState[]>`. All moves are strictly forward. The `scheduled → ready` transition is gated behind five requirements — `getAvailableActions()` returns a `blocked` flag and `blockedReasons[]` per action.

### Modal-backed actions
Actions that need configuration before transitioning (currently: Schedule Event) open a modal instead of calling `transitionState` directly. `ActionPanel` uses a `MODAL_ACTIONS` map to intercept these by action ID. Adding a new modal-backed action is one line in that map.

### Optimistic updates
Every mutation uses TanStack Query's `onMutate` to update the cache instantly, with `onError` rollback and `onSettled` invalidation. A shared `optimisticUpdate()` helper keeps all eight mutations consistent.

### Demotion rule
If a requirement is cleared while the event is `ready`, the service and the optimistic update both demote it back to `scheduled` automatically.

---

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **TanStack Query v5** — server state, optimistic updates
- **Lucide React** — icons
- **next/font** — Syne (display) + DM Mono (monospace)